import { toast } from 'react-toastify';

export const ToastTestButton = () => {
  const notify = () => {
    toast('This is a toast!');
    toast.success('This is a success!');
    toast.warn('This is a warning!');
    toast.error('This is an error!');
  };

  return (
    <div>
      <button onClick={notify}>Toast Me!</button>
    </div>
  );
};
