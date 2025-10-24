/**
 * @fileoverview Unit tests for CapitalizeInput component
 *
 * Tests the auto-capitalization input component including:
 * - Rendering with various props
 * - Auto-capitalize toggle behavior
 * - Text formatting on Enter key
 * - Optional vs forced capitalization modes
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CapitalizeInput } from '../capitalize-input';

describe('CapitalizeInput', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const handleChange = vi.fn();
      render(<CapitalizeInput value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should display label when provided', () => {
      const handleChange = vi.fn();
      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          label="Team Name"
          id="team-name"
        />
      );

      expect(screen.getByText('Team Name')).toBeInTheDocument();
    });

    it('should show placeholder text', () => {
      const handleChange = vi.fn();
      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          placeholder="Enter team name"
        />
      );

      expect(screen.getByPlaceholderText('Enter team name')).toBeInTheDocument();
    });

    it('should show checkbox toggle when hideCheckbox is false', () => {
      const handleChange = vi.fn();
      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          hideCheckbox={false}
          id="test-input"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should hide checkbox toggle when hideCheckbox is true', () => {
      const handleChange = vi.fn();
      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          hideCheckbox={true}
        />
      );

      const checkbox = screen.queryByRole('checkbox');
      expect(checkbox).not.toBeInTheDocument();
    });
  });

  describe('Auto-capitalize default state', () => {
    it('should have checkbox checked by default when defaultCapitalize is true', () => {
      const handleChange = vi.fn();
      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          defaultCapitalize={true}
          hideCheckbox={false}
          id="test-input"
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should have checkbox unchecked when defaultCapitalize is false', () => {
      const handleChange = vi.fn();
      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          defaultCapitalize={false}
          hideCheckbox={false}
          id="test-input"
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('User interaction', () => {
    it('should call onChange with raw value during typing', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<CapitalizeInput value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      // onChange should be called for each character typed
      expect(handleChange).toHaveBeenCalled();
      // Last call should have the full text
      expect(handleChange).toHaveBeenLastCalledWith('test');
    });

    it('should format text when Enter is pressed and auto-capitalize is on', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          defaultCapitalize={true}
          hideCheckbox={false}
          id="test-input"
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test team');
      await user.keyboard('{Enter}');

      // Should call onChange with formatted value
      expect(handleChange).toHaveBeenLastCalledWith('Test Team');
    });

    it('should not format text when Enter is pressed and auto-capitalize is off', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          defaultCapitalize={false}
          hideCheckbox={false}
          id="test-input"
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test team');

      handleChange.mockClear();
      await user.keyboard('{Enter}');

      // Should not call onChange again after Enter
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should toggle auto-capitalize when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          defaultCapitalize={true}
          hideCheckbox={false}
          id="test-input"
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);

      await user.click(checkbox);
      expect(checkbox.checked).toBe(false);

      await user.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Forced capitalization mode', () => {
    it('should always capitalize when hideCheckbox is true', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          hideCheckbox={true}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'main street');
      await user.keyboard('{Enter}');

      // Should format even without checkbox visible
      expect(handleChange).toHaveBeenLastCalledWith('Main Street');
    });
  });

  describe('Error state', () => {
    it('should display error message when error is true', () => {
      const handleChange = vi.fn();
      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          error={true}
          errorMessage="This field is required"
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should not display error message when error is false', () => {
      const handleChange = vi.fn();
      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          error={false}
          errorMessage="This field is required"
        />
      );

      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('should disable input when disabled prop is true', () => {
      const handleChange = vi.fn();
      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          disabled={true}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('should disable checkbox when disabled prop is true', () => {
      const handleChange = vi.fn();
      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          disabled={true}
          hideCheckbox={false}
          id="test-input"
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.disabled).toBe(true);
    });
  });

  describe('Custom format function', () => {
    it('should use custom formatFunction when provided', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const customFormat = (text: string) => text.toUpperCase();

      render(
        <CapitalizeInput
          value=""
          onChange={handleChange}
          formatFunction={customFormat}
          defaultCapitalize={true}
          hideCheckbox={false}
          id="test-input"
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenLastCalledWith('TEST');
    });
  });

  describe('Controlled value', () => {
    it('should display the controlled value', () => {
      const handleChange = vi.fn();
      render(
        <CapitalizeInput
          value="Test Value"
          onChange={handleChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Test Value');
    });

    it('should update when value prop changes', () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <CapitalizeInput
          value="Initial"
          onChange={handleChange}
        />
      );

      let input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Initial');

      rerender(
        <CapitalizeInput
          value="Updated"
          onChange={handleChange}
        />
      );

      input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Updated');
    });
  });
});
