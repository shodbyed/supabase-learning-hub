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
      <p>Here is where we tell you all about this website.</p>
      <Link to="/login">Go to Login</Link>
    </div>
  );
};
