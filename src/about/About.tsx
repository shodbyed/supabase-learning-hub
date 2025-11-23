import { Link } from 'react-router-dom';
import { SponsorLogos, sponsorConfigs } from '../components/SponsorLogos';

export const About: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4 relative">
        <SponsorLogos
          leftSponsor={sponsorConfigs.predator}
          rightSponsor={sponsorConfigs.bca}
        />
        <p className="text-xl font-bold text-gray-700">Welcome to</p>
        <h1 className="text-3xl font-bold">BCA League Network</h1>
      </div>
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">What We Do</h2>
          <p className="text-gray-700 leading-relaxed">
            BCA League Network empowers independent pool league operators with professional-grade management tools.
            Whether you're a bar owner, pool hall operator, or experienced player looking to start your own league,
            our platform handles the complexity so you can focus on growing your community.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Current Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>League Creation Wizard:</strong> Step-by-step setup for 8-Ball, 9-Ball, and 10-Ball leagues with automatic tournament conflict detection</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Flexible Formats:</strong> Support for 5-man and 8-man team formats with comprehensive handicap systems</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Smart Scheduling:</strong> Automated conflict detection around US holidays, BCA and APA championships with community-verified tournament dates</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Season Management:</strong> Create and manage multiple seasons with complete team and match tracking</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Team Registration:</strong> Player enrollment and team formation with venue assignment</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Match Tracking:</strong> Live scoring, handicap calculations, and standings updates</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Venue Management:</strong> Support for traveling leagues with multi-venue coordination</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Advanced Handicaps:</strong> Custom 5-man system with heavy balancing and BCA Standard with light balancing</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Member Management:</strong> Complete profile system with membership dues tracking and status indicators</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>League Operator Dashboard:</strong> Centralized control for all league operations and settings</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Educational Resources:</strong> Detailed guides explaining handicap systems, format differences, and league rules</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Coming Soon</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Messaging System:</strong> In-app communication for players, teams, and operators</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>House Rules Management:</strong> Custom rule configurations for league-specific requirements</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Team Invite System:</strong> Streamlined player recruitment and team formation</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Payout Calculator:</strong> Automated prize distribution based on league settings</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Scorecard Dispute Resolution:</strong> Operator tools for reviewing and resolving match disputes</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Future Vision</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>AI-Integrated Rules Assistant:</strong> Instant rule clarifications and situation guidance</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>AI Video Shot Referee:</strong> Computer vision analysis for disputed shots and rule enforcement</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>AI League Operator Assistant:</strong> Intelligent automation for scheduling, communication, and league management</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Philosophy</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Built by a league operator with 15 years of experience, this platform represents the tools we wish we had
            when starting out. No formal certifications or approval processes—just professional-grade software that
            makes running independent leagues accessible to anyone with pool experience.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We believe in empowering local operators to build thriving pool communities with minimal administrative burden,
            so more time can be spent on what matters: growing the sport and connecting players.
          </p>
        </section>

        <div className="pt-4 border-t">
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
};
