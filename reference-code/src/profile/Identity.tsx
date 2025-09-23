import { useState } from 'react';
import { Modal } from '../components/Modal';
import { FaRegSave, FaRegEdit } from 'react-icons/fa';
import { IdentityModal } from './IdentityModal';
import { useAuthContext } from '../context/useAuthContext';
import { Player } from 'bca-firebase-queries';

export const Identity = () => {
  const { player, refetchPlayer } = useAuthContext();
  const typedPlayer = player as Player | null;
  const [modalOpen, setModalOpen] = useState(false);
  const onClose = () => {
    refetchPlayer();
    setModalOpen(false);
  };
  return (
    <>
      <div className="profile-edit-group">
        <div className="profile-edit-label">Identity</div>
        <FaRegEdit
          className="profile-edit-value"
          onClick={() => setModalOpen(true)}
        />
      </div>

      <div className="profile-edit-group">
        <div className="profile-edit-label">Name:</div>
        {typedPlayer && (
          <div className="profile-edit-value">
            {typedPlayer.firstName} {typedPlayer.lastName}
          </div>
        )}
      </div>
      <div className="profile-edit-group">
        <div className="profile-edit-label">Date of birth:</div>
        {player && (
          <div className="profile-edit-value">{player.dob}</div>
        )}
      </div>
      <Modal isOpen={modalOpen} onClose={onClose}>
        <div className="modal-title">Identity</div>
        <div className="modal-body-container">
          {player && (
            <IdentityModal
              firstName={player.firstName}
              lastName={player.lastName}
              dob={player.dob}
              closeModal={() => setModalOpen(false)}
            />
          )}
        </div>
      </Modal>
    </>
  );
};
