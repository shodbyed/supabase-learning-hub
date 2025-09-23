import React, { useState, useEffect } from 'react';
// Correct the import statement like this
import billiard from '../assets/images/billiard.jpeg';
import './components.css';

type LoadingScreenProps = {
  message?: string;
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const [loadingText, setLoadingText] = useState(
    message ? message : 'Loading '
  );

  useEffect(() => {
    let dotsNumber = 0; // Track the number of dots

    const interval = setInterval(() => {
      dotsNumber = dotsNumber >= 3 ? 0 : dotsNumber + 1; // Increment dotsNumber or reset
      setLoadingText(
        `${message ? message : 'Loading'}${' .'.repeat(dotsNumber)}`
      ); // Set the text with appropriate dots
    }, 500);

    return () => clearInterval(interval); // Clean up
  }, []);

  const spinKeyframes = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;

  return (
    <div className="loading-container">
      <style>{spinKeyframes}</style>
      <img src={billiard} alt="Loading" className="rotating-image" />
      <p className="loading-text">{loadingText}</p>
    </div>
  );
};
