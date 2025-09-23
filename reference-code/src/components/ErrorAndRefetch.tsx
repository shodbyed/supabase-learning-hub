type ErrorMessageProps = {
  error: Error;
  onRetry: () => void;
};

export const ErrorAndRefetch = ({ error, onRetry }: ErrorMessageProps) => {
  return (
    <div>
      <p> An error occurred: {error.message}</p>

      <button className='small-button' onClick={onRetry}></button>
    </div>
  );
};
