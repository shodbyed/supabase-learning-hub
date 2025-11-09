/**
 * @fileoverview Test page for handicap system lookup
 * Simple counters for home and away team handicaps ranging from +6 to -6
 */

import { useState } from 'react';
import { useHandicapThresholds3v3 } from '@/api/hooks/useHandicaps';

export default function HandicapLookupTest() {
  const [homeHandicap, setHomeHandicap] = useState(0);
  const [awayHandicap, setAwayHandicap] = useState(0);

  const increment = (setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(prev => Math.min(prev + 1, 6));
  };

  const decrement = (setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(prev => Math.max(prev - 1, -6));
  };

  const homeDifferential = homeHandicap - awayHandicap;
  const awayDifferential = awayHandicap - homeHandicap;

  const { data: homeThresholds } = useHandicapThresholds3v3(homeDifferential);
  const { data: awayThresholds } = useHandicapThresholds3v3(awayDifferential);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2>Home Team</h2>
        <div>
          <button onClick={() => decrement(setHomeHandicap)}>-</button>
          <span style={{ margin: '0 20px', fontSize: '24px' }}>
            {homeHandicap > 0 ? '+' : ''}{homeHandicap}
          </span>
          <button onClick={() => increment(setHomeHandicap)}>+</button>
        </div>
        <div style={{ marginTop: '10px' }}>
          Differential: {homeDifferential > 0 ? '+' : ''}{homeDifferential}
        </div>
        {homeThresholds && (
          <div style={{ marginTop: '10px' }}>
            <div>Games to Win: {homeThresholds.games_to_win}</div>
            <div>Games to Tie: {homeThresholds.games_to_tie}</div>
            <div>Games to Lose: {homeThresholds.games_to_lose}</div>
          </div>
        )}
      </div>

      <div>
        <h2>Away Team</h2>
        <div>
          <button onClick={() => decrement(setAwayHandicap)}>-</button>
          <span style={{ margin: '0 20px', fontSize: '24px' }}>
            {awayHandicap > 0 ? '+' : ''}{awayHandicap}
          </span>
          <button onClick={() => increment(setAwayHandicap)}>+</button>
        </div>
        <div style={{ marginTop: '10px' }}>
          Differential: {awayDifferential > 0 ? '+' : ''}{awayDifferential}
        </div>
        {awayThresholds && (
          <div style={{ marginTop: '10px' }}>
            <div>Games to Win: {awayThresholds.games_to_win}</div>
            <div>Games to Tie: {awayThresholds.games_to_tie}</div>
            <div>Games to Lose: {awayThresholds.games_to_lose}</div>
          </div>
        )}
      </div>
    </div>
  );
}
