/**
 * @fileoverview Unit tests for profanity filter utilities
 * Tests profanity detection and censoring functionality
 */
import { describe, it, expect } from 'vitest';
import { containsProfanity, censorProfanity } from '@/utils/profanityFilter';

describe('profanityFilter', () => {
  describe('containsProfanity', () => {
    it('should detect profanity', () => {
      // Test with words that are in the @2toad/profanity default list
      expect(containsProfanity('This is shit')).toBe(true);
      expect(containsProfanity('What the fuck happened')).toBe(true);
    });

    it('should return false for clean text', () => {
      expect(containsProfanity('This is a great team')).toBe(false);
      expect(containsProfanity('Good game everyone')).toBe(false);
      expect(containsProfanity('The Arsenal team played well')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(containsProfanity('')).toBe(false);
      expect(containsProfanity('   ')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(containsProfanity('SHIT')).toBe(true);
      expect(containsProfanity('Shit')).toBe(true);
      expect(containsProfanity('shit')).toBe(true);
    });

    it('should handle profanity in context', () => {
      expect(containsProfanity('The shitty ref made a bad call')).toBe(true);
      expect(containsProfanity('What a fucking great shot')).toBe(true);
    });
  });

  describe('censorProfanity', () => {
    it('should replace profanity with symbols', () => {
      const censored = censorProfanity('This is shit');
      expect(censored).toContain('@#$%&!');
      expect(censored).not.toContain('shit');
    });

    it('should leave clean text unchanged', () => {
      const clean = 'This is a great team';
      expect(censorProfanity(clean)).toBe(clean);
    });

    it('should handle multiple profane words', () => {
      const censored = censorProfanity('fuck this shit');
      expect(censored).toContain('@#$%&!');
      expect(censored).not.toContain('fuck');
      expect(censored).not.toContain('shit');
    });

    it('should handle empty strings', () => {
      expect(censorProfanity('')).toBe('');
      expect(censorProfanity('   ')).toBe('   ');
    });

    it('should preserve message structure', () => {
      const original = 'Good game, shit that was close!';
      const censored = censorProfanity(original);

      // Should maintain sentence structure
      expect(censored).toContain('Good game');
      expect(censored).toContain('that was close!');
    });
  });

  describe('Team name validation use case', () => {
    it('should reject inappropriate team names', () => {
      expect(containsProfanity('The Fucking Winners')).toBe(true);
      expect(containsProfanity('Shit Happens FC')).toBe(true);
    });

    it('should accept appropriate team names', () => {
      expect(containsProfanity('The Assassins')).toBe(false);
      expect(containsProfanity('The Sharks')).toBe(false);
      expect(containsProfanity('8-Ball Legends')).toBe(false);
      expect(containsProfanity('Arsenal FC')).toBe(false); // Should not flag 'arse' in Arsenal
    });
  });

  describe('Message filtering use case', () => {
    it('should filter profanity for users with filter enabled', () => {
      const message = 'That was a fucking good shot!';
      const filtered = censorProfanity(message);

      expect(filtered).not.toContain('fucking');
      expect(filtered).toContain('@#$%&!');
      expect(filtered).toContain('good shot');
    });

    it('should handle complex messages', () => {
      const message = 'Great game tonight! See you next week.';
      const filtered = censorProfanity(message);

      // Clean messages should pass through unchanged
      expect(filtered).toBe(message);
    });
  });
});
