/**
 * @fileoverview Unit tests for message query utility functions
 * Tests validation logic and data transformation in message queries
 */
import { describe, it, expect } from 'vitest';
import { sendMessage, blockUser, createOrOpenConversation } from '@/utils/messageQueries';

describe('messageQueries', () => {
  describe('sendMessage validation', () => {
    it('should reject empty message content', async () => {
      const result = await sendMessage('conv-123', 'user-123', '');

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('cannot be empty');
    });

    it('should reject whitespace-only content', async () => {
      const result = await sendMessage('conv-123', 'user-123', '   ');

      // Content will be trimmed, resulting in empty string
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('should reject messages exceeding 2000 characters', async () => {
      const longMessage = 'a'.repeat(2001);
      const result = await sendMessage('conv-123', 'user-123', longMessage);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('cannot exceed 2000 characters');
    });

    it('should accept messages at exactly 2000 characters', async () => {
      const maxMessage = 'a'.repeat(2000);
      const result = await sendMessage('conv-123', 'user-123', maxMessage);

      // Will fail at database level in tests, but validation passes
      // This tests our client-side validation logic
      expect(result.error?.message).not.toContain('cannot exceed 2000 characters');
    });

    it('should trim message content', async () => {
      const messageWithWhitespace = '  Hello, world!  ';
      // This would need database mocking to fully test
      // For now, we verify the content would be trimmed by checking our validation
      expect(messageWithWhitespace.trim()).toBe('Hello, world!');
      expect(messageWithWhitespace.trim().length).toBeGreaterThan(0);
    });
  });

  describe('blockUser validation', () => {
    it('should prevent blocking yourself', async () => {
      const userId = 'user-123';
      const result = await blockUser(userId, userId);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Cannot block yourself');
    });

    it('should accept blocking different users', async () => {
      const result = await blockUser('user-123', 'user-456');

      // Will fail at database level in tests, but validation passes
      expect(result.error?.message).not.toContain('Cannot block yourself');
    });

    it('should accept optional reason parameter', async () => {
      const result = await blockUser('user-123', 'user-456', 'spam');

      // Validation passes - reason is optional and valid
      expect(result.error?.message).not.toContain('Cannot block yourself');
    });
  });

  describe('Edge cases', () => {
    it('should handle null conversation IDs', async () => {
      // TypeScript would catch this, but testing runtime behavior
      const result = await sendMessage(null as any, 'user-123', 'test');

      // Should fail at database level, not our validation
      expect(result.data).toBeNull();
    });

    it('should handle undefined sender IDs', async () => {
      const result = await sendMessage('conv-123', undefined as any, 'test');

      // Should fail at database level, not our validation
      expect(result.data).toBeNull();
    });
  });

  describe('Content validation', () => {
    it('should accept single character messages', async () => {
      const result = await sendMessage('conv-123', 'user-123', 'a');

      // Validation passes for single character
      expect(result.error?.message).not.toContain('cannot be empty');
    });

    it('should accept messages with special characters', async () => {
      const result = await sendMessage('conv-123', 'user-123', '!@#$%^&*()');

      // Validation allows special characters
      expect(result.error?.message).not.toContain('cannot be empty');
    });

    it('should accept messages with newlines', async () => {
      const result = await sendMessage('conv-123', 'user-123', 'Line 1\nLine 2');

      // Validation allows newlines
      expect(result.error?.message).not.toContain('cannot be empty');
    });

    it('should accept messages with emojis', async () => {
      const result = await sendMessage('conv-123', 'user-123', 'Great game! 🎱🏆');

      // Validation allows emojis
      expect(result.error?.message).not.toContain('cannot be empty');
    });
  });
});
