# Testing Issues - TanStack Migration

> **Created**: 2025-11-04
> **Purpose**: Track issues discovered during testing after TanStack Query migration
> **Status**: Active Testing

---

## 🐛 UI/UX Issues

### 1. Login Screen - Mobile Layout
**Priority**: Medium
**Component**: `/src/login/Login.tsx`
**Issue**: Login card appears too narrow on mobile screens. "Register" and "Forgot Password" links are scrunched together and hard to tap.

**Expected Behavior**: Card should be wider on mobile, with better spacing between action links

**Notes**:
- Works fine on desktop
- Need to adjust mobile-specific styling
- Consider increasing card width or using full-width on mobile
- Ensure links have proper touch targets (min 44x44px)

---

## ✅ Verified Working
- (Items will be added as testing progresses)

---

## 📝 Notes
- Testing started: 2025-11-04
- Focus: TanStack Query migration functionality
- ScoreMatch component refactoring complete (1,976 → 421 lines, -79%)
