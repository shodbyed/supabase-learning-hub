/**
 * @fileoverview Profile-Related Info Button Content
 * Centralized info content for profile pages and forms
 */

/**
 * Nickname Info Content
 * Used in: New Player Form, Profile Personal Info Section
 * Explains how nicknames work and how they're auto-generated
 */
export const nicknameInfo = {
  title: 'About Nicknames',
  content: (
    <div className="space-y-2">
      <p>Your nickname will be displayed in the mobile app on buttons used during gameplay.</p>
      <p><strong>Long-pressing your nickname reveals your full name</strong> to other players in the app.</p>
      <p className="font-semibold">If you don't choose a nickname, we'll create one for you:</p>
      <ul className="list-disc ml-4 space-y-1">
        <li>First try: Full name (if under 12 characters)</li>
        <li>Then: First name + last initial (e.g., "John D")</li>
        <li>Then: First initial + last name (e.g., "J Doe")</li>
        <li>Last resort: First 4 letters of each (e.g., "John Smit")</li>
      </ul>
    </div>
  ),
  contentWithChangeNote: (
    <div className="space-y-2">
      <p>Your nickname will be displayed in the mobile app on buttons used during gameplay.</p>
      <p><strong>Long-pressing your nickname reveals your full name</strong> to other players in the app.</p>
      <p className="font-semibold">If you don't choose a nickname, we'll create one for you:</p>
      <ul className="list-disc ml-4 space-y-1">
        <li>First try: Full name (if under 12 characters)</li>
        <li>Then: First name + last initial (e.g., "John D")</li>
        <li>Then: First initial + last name (e.g., "J Doe")</li>
        <li>Last resort: First 4 letters of each (e.g., "John Smit")</li>
      </ul>
      <p className="mt-2 text-gray-600 italic">You can change your nickname anytime from your profile page.</p>
    </div>
  ),
};
