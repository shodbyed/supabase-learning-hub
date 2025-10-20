-- Debug: See all current conversations and participants
SELECT
  c.id as conversation_id,
  c.title,
  c.created_at,
  cp.user_id as participant_member_id,
  m.first_name,
  m.last_name,
  m.system_player_number,
  m.user_id as auth_user_id
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
JOIN members m ON cp.user_id = m.id
ORDER BY c.created_at DESC, m.last_name;

-- See all messages
SELECT
  msg.id,
  msg.content,
  msg.created_at,
  sender.first_name as sender_first,
  sender.last_name as sender_last,
  sender.system_player_number as sender_number
FROM messages msg
JOIN members sender ON msg.sender_id = sender.id
ORDER BY msg.created_at DESC;
