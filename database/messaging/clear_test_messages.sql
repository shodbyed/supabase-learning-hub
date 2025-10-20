-- Clear all test messages and conversations
-- WARNING: This will delete ALL messages and conversations

-- Delete all messages first (due to foreign key)
DELETE FROM messages;

-- Delete all conversation participants
DELETE FROM conversation_participants;

-- Delete all conversations
DELETE FROM conversations;

-- Verify everything is cleared
SELECT 'Messages count:' as info, COUNT(*) as count FROM messages
UNION ALL
SELECT 'Participants count:', COUNT(*) FROM conversation_participants
UNION ALL
SELECT 'Conversations count:', COUNT(*) FROM conversations;
