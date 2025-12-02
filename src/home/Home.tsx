import { Link } from 'react-router-dom';
import { useUser } from '../context/useUser';
import { useUserProfile } from '@/api/hooks';
import { LogoutButton } from '../login/LogoutButton';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
// import { CurrentSponsors } from '../components/SponsorLogos';

export const Home: React.FC = () => {
  const { isLoggedIn, user } = useUser();
  const { member, loading, needsToCompleteApplication } = useUserProfile();

  if (!isLoggedIn) {
    return (
      <div>
        <PageHeader
          backTo="/about"
          backLabel="About Us"
          preTitle="Welcome to"
          title="Rack'em Leagues"
          subtitle="Please log in to access your account and member features."
        />
        <div className="w-full lg:max-w-2xl mx-auto p-6">
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          backTo="/about"
          backLabel="About Us"
          preTitle="Welcome to"
          title="Rack'em Leagues"
        />
        <div className="max-w-2xl mx-auto p-6">
          <p>Loading your account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        backTo="/about"
        backLabel="About Us"
        title="Rack'em Leagues"
        subtitle="Welcome"
      />
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <p className="text-lg mb-2">
            Hello <strong>{user?.email}</strong>!
          </p>

          {member ? (
            <p className="text-green-600 font-medium">
              Welcome back, {member.first_name}! You're all set up as a member.
            </p>
          ) : (
            <p className="text-orange-600 font-medium">
              You're logged in but haven't completed your member application yet.
            </p>
          )}
        </div>

        <div className="space-y-4">
          {needsToCompleteApplication() ? (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">Complete Your Application</h3>
              <p className="text-orange-700 mb-3">
                To access member features, please complete your player application.
              </p>
              <Link to="/new-player">
                <Button>Complete Application</Button>
              </Link>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Access Your Dashboard</h3>
              <p className="text-green-700 mb-3">
                View your member information and access league features.
              </p>
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          )}

          <div className="flex justify-end items-center pt-4 border-t">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
};
