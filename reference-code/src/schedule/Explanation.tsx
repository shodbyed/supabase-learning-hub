import { useState } from 'react';

export const Explanation = () => {
  const [showExplanation, setShowExplanation] = useState(false);
  return (
    <>
      <div className='add-explain-container'>
        <button
          className='medium-button'
          onClick={() => setShowExplanation(!showExplanation)}
        >
          {showExplanation ? 'Got it!' : 'Explain This?'}
        </button>
        {showExplanation && (
          <>
            <div className='add-explain'>
              <div className='add-explain-title'>Name:</div>
              <div className='add-explain-text'>
                Enter the name you want to show up in the schedule. This will be
                printed exactly how it is entered.
              </div>
            </div>

            <div className='add-explain'>
              <div className='add-explain-title'>Start Date:</div>
              <div className='add-explain-text'>
                Enter the start date of the event
              </div>
            </div>

            <div className='add-explain'>
              <div className='add-explain-title'>End Date:</div>
              <div className='add-explain-text'>
                Enter the end date of the event
              </div>
            </div>

            <div className='add-explain'>
              <div className='add-explain-title'>Create:</div>
              <div className='add-explain-text'>
                This will create a custom holiday/event that you can resolve as
                the other holidays by inserting it into the schedule or
                dismissing it
              </div>
            </div>

            <div className='add-explain'>
              <div className='add-explain-title'>NOTE:</div>
              <div className='add-explain-text'>
                This will search for any scheduled league play within these
                dates (plus 2 days before and 2 days after) and create a new
                holiday for you to resolve.
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
