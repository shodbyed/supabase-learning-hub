/**
 * @fileoverview League Creation Wizard Info Button Content
 * Centralized info content for all league wizard steps
 */

/**
 * Start Date Info
 * Used in: League wizard start date step
 */
export const startDateInfo = {
  title: 'Choosing Your Start Date',
  content: 'The start date determines your league\'s day of the week and season classification. Choose a date that gives teams enough time to register and prepare.',
};

/**
 * Season Length Info
 * Used in: League wizard season length selection step
 */
export const seasonLengthInfo = {
  title: 'Season Length Guidelines',
  content: 'Most leagues run 14-16 weeks including regular season and playoffs. Shorter seasons work well for new leagues or venues testing the waters. Longer seasons provide more matches but require stronger player commitment.',
};

/**
 * Custom Season Length Info
 * Used in: League wizard custom season length input step
 */
export const customSeasonLengthInfo = {
  title: 'Custom Season Length',
  content: 'Consider holidays, venue availability, and player commitment when choosing your season length. Include time for regular season, playoffs, and any breaks.',
};

/**
 * Game Format Info
 * Used in: League wizard game type selection (8-ball, 9-ball, 10-ball)
 */
export const gameFormatInfo = {
  title: 'Game Format Differences',
  content: '8-ball is most popular and familiar to players. 9-ball and 10-ball are faster but require more skill. Choose based on your player base and venue preferences.',
};

/**
 * Tournament Scheduling Info
 * Used in: BCA and APA tournament scheduling steps
 */
export const tournamentSchedulingInfo = {
  title: 'Why Schedule Around Major Tournaments?',
  content: (
    <div className="space-y-4">
      <p><strong>Many players want to compete in BCA and APA Championships.</strong> These tournaments represent the highest level of pool competition.</p>

      <div>
        <p><strong>Scheduling during tournaments causes problems:</strong></p>
        <ul className="list-disc ml-4 mt-2">
          <li>Teams lose key players who travel to compete</li>
          <li>Unnecessary forfeits when rosters are short</li>
          <li>Complicated makeup matches later in the season</li>
        </ul>
      </div>

      <p><strong>If any of your players might attend these championships, schedule around them.</strong> This supports player growth and keeps your league running smoothly.</p>
    </div>
  ),
  label: 'Why is this important',
};

/**
 * APA Nationals Info
 * Used in: APA nationals date entry step
 */
export const apaNationalsInfo = {
  title: 'APA Nationals Scheduling',
  content: 'APA Nationals typically occur in late spring/early summer. Visit poolplayers.com for current tournament dates and locations.',
};

/**
 * Tournament Calendar Info
 * Used in: Final tournament dates review step
 */
export const tournamentCalendarInfo = {
  title: 'Complete Tournament Calendar',
  content: 'Having both BCA and APA tournament dates ensures your league schedule works around all major national competitions.',
};

/**
 * 5-Man Team Format Info
 * Detailed explanation of how the 5-man format works
 */
export const fiveManFormatInfo = {
  title: '5-Man Teams Explained',
  content: (
    <div className="space-y-4">
      <div>
        <p className="font-semibold mb-2">How It Works:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Teams have <strong>5 total players</strong> on the roster</li>
          <li><strong>3 players play</strong> on match night</li>
          <li><strong>Double round robin format</strong> - everyone plays everyone twice</li>
          <li><strong>6 games per player</strong>, 18 games total per match</li>
        </ul>
      </div>

      <div>
        <p className="font-semibold mb-2">Handicap System:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li><strong>5 skill levels:</strong> +2, +1, 0, -1, -2</li>
          <li><strong>Skill level calculation:</strong> (Wins - Losses) ÷ Weeks Played</li>
          <li><strong>Team handicap:</strong> Sum of 3 players' skill levels + team modifier</li>
          <li><strong>Team modifier:</strong> Derived from current standings position</li>
          <li><strong>Games needed:</strong> Compare team handicaps to determine wins needed to win/tie</li>
        </ul>
      </div>

      <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
        <p className="text-sm"><strong>Why players prefer this format:</strong></p>
        <p className="text-sm text-gray-700 mt-1">Faster matches (2-2.5 hours), more playing time per person, less crowded tables, easier team management, and less handicap complaints.</p>
      </div>

      <p className="text-sm text-blue-600 font-medium">
        <a href="/5-man-format-details" className="underline">Click here for complete 5-man format breakdown</a>
      </p>
    </div>
  ),
};

/**
 * 8-Man Team Format Info
 * Detailed explanation of traditional 8-man format
 */
export const eightManFormatInfo = {
  title: '8-Man Teams Explained',
  content: (
    <div className="space-y-4">
      <div>
        <p className="font-semibold mb-2">How It Works:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Teams have <strong>8+ total players</strong> on the roster</li>
          <li><strong>5 players play</strong> on match night</li>
          <li><strong>Single round robin format</strong> - everyone plays everyone once</li>
          <li><strong>5 games per player</strong>, 25 games total per match</li>
        </ul>
      </div>

      <div>
        <p className="font-semibold mb-2">Traditional Format Characteristics:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li><strong>BCA Standard:</strong> Uses official BCA handicap tables</li>
          <li><strong>Larger rosters:</strong> More flexibility if players can't make it</li>
          <li><strong>Familiar system:</strong> Players who've done BCA know this format</li>
          <li><strong>Longer matches:</strong> Average 3-4 hours per night</li>
          <li><strong>More crowded:</strong> 10-16 people around tables when full rosters show up</li>
          <li><strong>Less playing time:</strong> Each player shoots only 5 games per night</li>
        </ul>
      </div>

      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
        <p className="text-sm"><strong>Best for:</strong></p>
        <p className="text-sm text-gray-700 mt-1">Established leagues with large player pools who prefer traditional BCA format.</p>
      </div>

      <p className="text-sm text-blue-600 font-medium">
        <a href="/8-man-format-details" className="underline">Click here for complete 8-man format breakdown</a>
      </p>
    </div>
  ),
};

/**
 * Team Format Comparison Info
 * Side-by-side comparison of both formats
 */
export const teamFormatComparisonInfo = {
  title: 'Format Comparison',
  content: (
    <div className="space-y-4">
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <p className="font-semibold text-gray-900 mb-2">Before you choose, familiarize yourself with how each format works:</p>
        <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
          <li><strong>Extensive explanations:</strong> Click the links below for complete breakdowns of each format</li>
          <li><strong>Quick overview:</strong> Use the info buttons next to each choice for shorter explanations</li>
          <li><strong>Side-by-side comparison:</strong> Review both formats together to see key differences</li>
        </ul>
      </div>

      <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
        <p className="text-sm font-semibold text-gray-900 mb-1">Decision Guide:</p>
        <p className="text-sm text-gray-700">
          <strong>Established league?</strong> If your league is already running with a specific format, stick with the most similar option for familiarity.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <strong>New league?</strong> The 5-Man format is worth trying - it provides faster matches, better player experience, and easier management.
        </p>
      </div>

      <p className="text-sm text-blue-600 font-medium">
        <a href="/format-comparison" className="underline">For a side-by-side comparison of our 2 systems, click here</a>
      </p>
    </div>
  ),
};

/**
 * League Qualifier Info
 * Used in: Optional league qualifier/name suffix step
 */
export const leagueQualifierInfo = {
  title: 'League Qualifiers',
  content: 'Optional qualifier helps distinguish your league if there are multiple leagues with the same game type and night at the same venue. Examples: location-based (West Side, Downtown), color-coded (Blue, Red), or division-based (Division A, Advanced).',
};
