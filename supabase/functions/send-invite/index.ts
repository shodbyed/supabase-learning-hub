/**
 * @fileoverview Send Invite Edge Function
 *
 * Phase 2-4: Sends an email with a registration link to a placeholder player.
 * First checks if the email already exists in auth.users.
 * Creates an invite_token record to track the invite.
 *
 * Request body:
 *   - memberId: UUID of the placeholder player
 *   - email: Email address to send invite to
 *   - teamId: UUID of the team sending the invite (for context/tracking only)
 *   - invitedByMemberId: UUID of the captain/operator sending the invite
 *   - teamName: Name of the team (for email content)
 *   - captainName: Name of the captain sending the invite
 *   - baseUrl: The app's base URL (e.g., https://app.rackemleagues.com)
 *
 * Behavior:
 *   - If email NOT in auth.users -> creates invite_token and sends registration invite email
 *   - If email IS in auth.users -> returns error (user already registered)
 *
 * Note: The PP may be on multiple teams. The teamId is just for context (who sent the invite).
 * When the user claims the invite, they link to the PP's member record which already has
 * all their team_players relationships intact. They'll be on all teams automatically.
 *
 * Usage:
 *   POST /functions/v1/send-invite
 *   {
 *     "memberId": "uuid-here",
 *     "email": "player@example.com",
 *     "teamId": "team-uuid-here",
 *     "invitedByMemberId": "captain-member-uuid",
 *     "teamName": "The Breakers",
 *     "captainName": "John Smith",
 *     "baseUrl": "https://app.rackemleagues.com"
 *   }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for API key
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse request body
    const { memberId, email, teamId, invitedByMemberId, teamName, captainName, baseUrl } = await req.json();

    // Validate required fields
    if (!memberId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: memberId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing required field: email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!teamId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: teamId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!invitedByMemberId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: invitedByMemberId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required field: baseUrl" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check Supabase credentials
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Supabase credentials not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check auth.users for this email
    const { data: existingUsers, error: lookupError } = await supabaseAdmin.auth.admin.listUsers();

    if (lookupError) {
      console.error("Error checking auth.users:", lookupError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing users", details: lookupError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if any user has this email
    const emailLower = email.toLowerCase();
    const existingUser = existingUsers?.users?.find(
      (u: { email?: string }) => u.email?.toLowerCase() === emailLower
    );

    if (existingUser) {
      // User already exists - return error for now (Phase 5 will handle this differently)
      return new Response(
        JSON.stringify({
          error: "User already registered",
          message: "This email is already associated with a registered account.",
          existingUserId: existingUser.id
        }),
        { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Email not in auth - create invite token and send email

    // Check if there's already a pending invite for this member+email
    const { data: existingInvite } = await supabaseAdmin
      .from("invite_tokens")
      .select("id, token, expires_at")
      .eq("member_id", memberId)
      .eq("email", emailLower)
      .eq("status", "pending")
      .single();

    let token: string;

    if (existingInvite) {
      // Reuse existing token (resend the invite)
      token = existingInvite.token;
      console.log("Reusing existing invite token for member:", memberId);
    } else {
      // Create new invite token
      const { data: newInvite, error: insertError } = await supabaseAdmin
        .from("invite_tokens")
        .insert({
          member_id: memberId,
          email: emailLower,
          team_id: teamId,
          invited_by_member_id: invitedByMemberId,
          status: "pending",
        })
        .select("token")
        .single();

      if (insertError) {
        console.error("Error creating invite token:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create invite token", details: insertError.message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      token = newInvite.token;
      console.log("Created new invite token for member:", memberId);
    }

    // Build the registration link with token
    const registrationLink = `${baseUrl}/register?claim=${memberId}&token=${token}`;

    // Build the email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Join ${teamName || "the team"} on Rack'em Leagues</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; margin-bottom: 10px;">You're Invited!</h1>
          </div>

          <p style="font-size: 16px;">
            ${captainName ? `<strong>${captainName}</strong> has` : "Your team captain has"}
            added you to <strong>${teamName || "their team"}</strong> on Rack'em Leagues.
          </p>

          <p style="font-size: 16px;">
            Click the button below to create your account and join the team:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${registrationLink}"
               style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Join Team
            </a>
          </div>

          <p style="font-size: 14px; color: #666;">
            Or copy and paste this link into your browser:
          </p>
          <p style="font-size: 14px; color: #2563eb; word-break: break-all;">
            ${registrationLink}
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            This invite was sent via Rack'em Leagues. If you didn't expect this email, you can safely ignore it.
            <br>This link expires in 7 days.
          </p>
        </body>
      </html>
    `;

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", // TODO: Change to invites@rackemleagues.com after domain verification
        to: email,
        subject: `Join ${teamName || "the team"} on Rack'em Leagues`,
        html: emailHtml,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: data }),
        { status: res.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invite email sent!",
        token: token,  // Return token for testing/debugging
        data
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
