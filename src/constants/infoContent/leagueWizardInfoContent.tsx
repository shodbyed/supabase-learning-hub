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
 * Team Format Info
 * Used in: 5-man vs 8-man team selection step
 */
export const teamFormatInfo = {
  title: 'Team Format Impact',
  content: 'This choice affects every aspect of your league: player requirements, match length, venue needs, and management complexity. Choose based on your venue size, player pool, and time constraints.',
};

/**
 * League Qualifier Info
 * Used in: Optional league qualifier/name suffix step
 */
export const leagueQualifierInfo = {
  title: 'League Qualifiers',
  content: 'Optional qualifier helps distinguish your league if there are multiple leagues with the same game type and night at the same venue. Examples: location-based (West Side, Downtown), color-coded (Blue, Red), or division-based (Division A, Advanced).',
};
