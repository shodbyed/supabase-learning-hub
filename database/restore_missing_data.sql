-- Restore missing data from Dec 7 dump
-- These tables failed due to schema changes

-- 1. organizations (was league_operators)
-- Old columns: id, member_id, organization_name, organization_address, organization_city, organization_state, organization_zip_code, contact_disclaimer_acknowledged, league_email, email_visibility, league_phone, phone_visibility, stripe_customer_id, payment_method_id, card_last4, card_brand, expiry_month, expiry_year, billing_zip, payment_verified, created_at, updated_at, profanity_filter_enabled
-- New columns: id, created_by (was member_id), organization_name, organization_address, organization_city, organization_state, organization_zip_code, organization_email (was league_email), organization_email_visibility (was email_visibility), organization_phone (was league_phone), organization_phone_visibility (was phone_visibility), stripe_customer_id, payment_method_id, card_last4, card_brand, expiry_month, expiry_year, billing_zip, payment_verified, profanity_filter_enabled, created_at, updated_at
-- Removed: contact_disclaimer_acknowledged

INSERT INTO "public"."organizations" (
    "id", "created_by", "organization_name", "organization_address", "organization_city",
    "organization_state", "organization_zip_code", "organization_email", "organization_email_visibility",
    "organization_phone", "organization_phone_visibility", "stripe_customer_id", "payment_method_id",
    "card_last4", "card_brand", "expiry_month", "expiry_year", "billing_zip", "payment_verified",
    "created_at", "updated_at", "profanity_filter_enabled"
) VALUES (
    '179e8f3d-9856-47bc-98e6-2b22e809f3f2',
    '0cf4b3d9-108c-43aa-92a4-90961dc9e76b',  -- member_id -> created_by
    'Ed''s Florida Leagues',
    '6101 Twilight Dr',
    'Zephyrhills',
    'FL',
    '33540',
    'shodbyed@gmail.com',  -- league_email -> organization_email
    'my_organization',     -- email_visibility -> organization_email_visibility
    '8059072636',          -- league_phone -> organization_phone
    'my_teams',            -- phone_visibility -> organization_phone_visibility
    'cus_mock_0iny9seluqe50000',
    'pm_mock_u0upowy9mn000000',
    '4242',
    'visa',
    12,
    2027,
    '12345',
    true,
    '2025-10-12 00:00:43.639001+00',
    '2025-11-04 12:40:13.709527+00',
    false
);

-- 2. leagues (operator_id -> organization_id)
INSERT INTO "public"."leagues" (
    "id", "organization_id", "game_type", "day_of_week", "division", "team_format",
    "league_start_date", "created_at", "updated_at", "status", "handicap_variant",
    "team_handicap_variant", "golden_break_counts_as_win", "handicap_level"
) VALUES
    ('0dc7fe28-f672-4e83-b62d-740fa18adb3b', '179e8f3d-9856-47bc-98e6-2b22e809f3f2', 'eight_ball', 'wednesday', 'New', '5_man', '2025-11-12', '2025-11-05 04:00:43.661837+00', '2025-11-05 04:00:43.661837+00', 'active', 'standard', 'standard', true, 'standard'),
    ('5eaa49dd-263e-4724-a9b5-190b4be1eae4', '179e8f3d-9856-47bc-98e6-2b22e809f3f2', 'eight_ball', 'tuesday', 'Testing Shit', '5_man', '2025-11-11', '2025-11-05 20:07:20.729601+00', '2025-11-05 20:07:20.729601+00', 'active', 'standard', 'standard', true, 'standard');

-- 3. venues (created_by_operator_id -> organization_id)
-- Must include bar_box_table_numbers array to satisfy total_tables > 0 constraint
INSERT INTO "public"."venues" (
    "id", "organization_id", "venue_owner_id", "name", "street_address", "city", "state",
    "zip_code", "phone", "bar_box_tables", "regulation_tables", "proprietor_name",
    "proprietor_phone", "league_contact_name", "league_contact_phone", "league_contact_email",
    "website", "business_hours", "notes", "is_active", "created_at", "updated_at",
    "bar_box_table_numbers"
) VALUES
    ('8ee822ea-5ff8-4c78-90ee-9baa3acf6f57', '179e8f3d-9856-47bc-98e6-2b22e809f3f2', NULL, 'Crystals', '5707 Gall Bl', 'Zephyrhills', 'FL', '33540', '813-715-2004', 4, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-12 00:31:50.355931+00', '2025-10-12 00:47:50.40834+00', ARRAY[1,2,3,4]),
    ('b9d6be5e-c98b-4569-a83a-1e5adc89b096', '179e8f3d-9856-47bc-98e6-2b22e809f3f2', NULL, 'happy dayz', '12401 us 301', 'dade city', 'FL', '33525', '352-521-5003', 6, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-10-12 00:52:17.780418+00', '2025-10-12 00:52:17.780418+00', ARRAY[1,2,3,4,5,6]),
    ('ece734e4-3483-42f9-976a-4d4a1650db67', '179e8f3d-9856-47bc-98e6-2b22e809f3f2', NULL, 'buteras billiards', '1234 shit st', 'tampa', 'FL', '33555', '283-746-5833', 6, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-02 18:27:58.366982+00', '2025-11-02 18:40:35.882019+00', ARRAY[1,2,3,4,5,6]),
    ('ad877885-68e0-435f-ab56-9a48a1a07fd0', '179e8f3d-9856-47bc-98e6-2b22e809f3f2', NULL, 'cool pool', '9874 calutrans', 'zephyrhills', 'FL', '33540', '384-783-6733', 6, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-02 19:05:04.203804+00', '2025-11-02 19:05:21.777335+00', ARRAY[1,2,3,4,5,6]),
    ('5b9ef269-deff-4d98-81eb-b3821f5e161c', '179e8f3d-9856-47bc-98e6-2b22e809f3f2', NULL, 'newest test venue 2', '4321 asshole st', 'zephyrhills', 'FL', '33540', '423-123-6889', 7, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-02 19:13:16.138311+00', '2025-11-02 19:13:52.67291+00', ARRAY[1,2,3,4,5,6,7]);

-- 4. league_venues
INSERT INTO "public"."league_venues" ("id", "league_id", "venue_id", "available_bar_box_tables", "available_regulation_tables", "added_at", "updated_at") VALUES
    ('34607c40-baf0-40e8-8989-88da115f53c2', '0dc7fe28-f672-4e83-b62d-740fa18adb3b', 'ece734e4-3483-42f9-976a-4d4a1650db67', 6, 0, '2025-11-05 04:01:53.313646+00', '2025-11-05 04:01:53.313646+00'),
    ('c6ff00b5-1557-49ce-b1ba-062f016acfb1', '0dc7fe28-f672-4e83-b62d-740fa18adb3b', 'ad877885-68e0-435f-ab56-9a48a1a07fd0', 6, 0, '2025-11-05 04:01:55.468195+00', '2025-11-05 04:01:55.468195+00'),
    ('9ffb4ce7-9009-4ffb-bc6b-d753ab40a5bf', '0dc7fe28-f672-4e83-b62d-740fa18adb3b', '8ee822ea-5ff8-4c78-90ee-9baa3acf6f57', 4, 0, '2025-11-05 04:01:55.468195+00', '2025-11-05 04:01:55.468195+00'),
    ('0da80a6f-b3e4-4d5d-980f-1cccaaf47ce3', '0dc7fe28-f672-4e83-b62d-740fa18adb3b', 'b9d6be5e-c98b-4569-a83a-1e5adc89b096', 6, 0, '2025-11-05 04:01:55.468195+00', '2025-11-05 04:01:55.468195+00'),
    ('b3e31d60-900c-4499-a1db-2156e08a9e9b', '0dc7fe28-f672-4e83-b62d-740fa18adb3b', '5b9ef269-deff-4d98-81eb-b3821f5e161c', 7, 0, '2025-11-05 04:01:55.468195+00', '2025-11-05 04:01:55.468195+00'),
    ('c20e0aa3-3cd9-4819-9800-387610a2de3f', '5eaa49dd-263e-4724-a9b5-190b4be1eae4', 'ece734e4-3483-42f9-976a-4d4a1650db67', 6, 0, '2025-11-05 20:13:51.124632+00', '2025-11-05 20:13:51.124632+00'),
    ('a83d6451-7a9d-4abd-b90c-a52871e6f497', '5eaa49dd-263e-4724-a9b5-190b4be1eae4', 'ad877885-68e0-435f-ab56-9a48a1a07fd0', 6, 0, '2025-11-05 20:13:51.124632+00', '2025-11-05 20:13:51.124632+00'),
    ('b3af551b-1dcc-43e6-845d-754bb6f0e05a', '5eaa49dd-263e-4724-a9b5-190b4be1eae4', '8ee822ea-5ff8-4c78-90ee-9baa3acf6f57', 4, 0, '2025-11-05 20:13:51.124632+00', '2025-11-05 20:13:51.124632+00'),
    ('0b70dbda-136d-467d-8fbd-fa5f4d877e37', '5eaa49dd-263e-4724-a9b5-190b4be1eae4', 'b9d6be5e-c98b-4569-a83a-1e5adc89b096', 6, 0, '2025-11-05 20:13:51.124632+00', '2025-11-05 20:13:51.124632+00'),
    ('872f114d-bcb7-4d5a-86b3-2b62a111092a', '5eaa49dd-263e-4724-a9b5-190b4be1eae4', '5b9ef269-deff-4d98-81eb-b3821f5e161c', 7, 0, '2025-11-05 20:13:51.124632+00', '2025-11-05 20:13:51.124632+00');
