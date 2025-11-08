import { supabase } from '@/supabaseClient';
import type {  RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type {MatchGame, MatchWithLeagueSettings} from '@/types'

type Payload = RealtimePostgresChangesPayload<MatchGame | Partial<MatchWithLeagueSettings>>
    

    export const watchMatchAndGames = ( 
        matchId:string 
    ) => {
    console.log('MY CHANNEL IS ACTIVE', matchId);
        const handler = (payload: Payload )=> {
            console.log('HANDLER FIRED')
            console.log('SOME CHANGE', payload)
            if(payload.table === 'match_games'){console.log('GAMES',payload.new)}
            if(payload.table === 'matches'){console.log('MATCHES',payload.new)}
        }
  
    const channel = supabase.channel(`match_${matchId}`);

  // Watch the match row
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'matches',
      filter: `id=eq.${matchId}`,
    },
    handler
  );

  // Watch all match_games rows for that match
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'match_games',
      filter: `match_id=eq.${matchId}`,
    },
    handler
  );

  channel.subscribe((status)=>{
    console.log('STATUS', status)
    if (status=== 'SUBSCRIBED'){
        console.log('CHANNEL CONNECTED')

    }else if (status === 'CHANNEL_ERROR') {
        console.error('CHANNEL ERROR')
    } else if (status === 'TIMED_OUT') {
        console.error('TIMED OUT')
    } else {console.log('NOTHING HAPPENED')}
  });

  return channel;
};
