import { PastPlayer } from 'bca-firebase-queries';

type UpdateProfileProps = {
  pastPlayer: PastPlayer;
};

export const UpdateProfile = ({ pastPlayer }: UpdateProfileProps) => {
  return (
    <div>
      <div>UpdateProfile{pastPlayer.firstName}</div>
    </div>
  );
};
