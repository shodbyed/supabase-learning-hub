import { FaQuestionCircle } from 'react-icons/fa';
import { infoBlurbs } from '../assets/infoBlurbs';
import { useEffect, useState } from 'react';

type InfoButtonProps = {
  infoBlurbKey?: keyof typeof infoBlurbs;
  size?: number;
};

export const InfoButton = ({ infoBlurbKey = 'sample' }: InfoButtonProps) => {
  // state
  const [showDialog, setShowDialog] = useState(false);
  const [size, setSize] = useState(window.innerWidth > 600 ? 20 : 10);
  const blurb = infoBlurbs[infoBlurbKey];

  useEffect(() => {
    const handleResize = () => {
      setSize(window.innerWidth > 600 ? 20 : 10);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // functions
  const openDialog = () => setShowDialog(true);
  const closeDialog = () => setShowDialog(false);

  return (
    <div>
      <FaQuestionCircle
        style={{ color: 'blue', background: 'white', borderRadius: '50%' }}
        size={size}
        onClick={openDialog}
      />

      <dialog
        style={{
          border: '3px solid blue',
          color: 'lightblue',
        }}
        open={showDialog}
        onClick={closeDialog}
      >
        {showDialog &&
          blurb.map((blurb, index) => (
            <div style={{ minHeight: '15px' }} key={index}>
              {blurb}
            </div>
          ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'end',
            marginTop: '25px',
            color: 'blue',
          }}
        >
          Click inside box to close
        </div>
      </dialog>
    </div>
  );
};
