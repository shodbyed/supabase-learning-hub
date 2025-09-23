import { Player, BarePlayer } from 'bca-firebase-queries';
import { ViewToEditTextField } from '../components/ViewToEditTextField';
import { useAuthContext } from '../context/useAuthContext';
import './profile.css';
import { Modal } from '../components/Modal';
import { Identity } from './Identity';

type PlayerLabels = {
  key: keyof Player;
  label: string;
};

export const Profile = () => {
  const { player } = useAuthContext();
  const typedPlayer = player as Player | null;
  const playerKeys2 = player ? Object.keys(player) : [];
  const playerKeys: PlayerLabels[] = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'nickname', label: 'Nickname' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zip', label: 'Zip' },
    { key: 'dob', label: 'Date of Birth' },
  ];

  const onSave = (value: string, label: string) => {
    console.log('onSave profile', value, label);
  };
  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>
      <div className="profile-grid-container">
        {typedPlayer && (
          <Identity
            firstName={typedPlayer.firstName}
            lastName={typedPlayer.lastName}
            dob={typedPlayer.dob}
          />
        )}
      </div>

      <div className="profile-grid-container">
        <ViewToEditTextField
          label="This is a Label 1"
          value="this is a value 1"
          onSave={onSave}
        />
        <ViewToEditTextField label="Label 2" value="value 2" onSave={onSave} />
        <ViewToEditTextField
          label="This Label 3"
          value="this is a value 3"
          onSave={onSave}
        />
      </div>
    </div>
  );
};
