/**
 * @fileoverview Table size constants and configuration
 *
 * Centralized definitions for pool table sizes used throughout the application.
 * Includes display labels, info content, and size specifications.
 */

import type { TableSizeKey } from '@/types/venue';

/**
 * Configuration for each table size category
 * Used in venue creation/edit forms and table displays
 */
export interface TableSizeConfig {
  /** Database field key */
  key: TableSizeKey;
  /** Short display label (e.g., "7-Foot") */
  label: string;
  /** Title for info tooltip */
  infoTitle: string;
  /** Detailed description for info tooltip */
  infoContent: string;
}

/**
 * Standard pool table sizes with their display information
 * Ordered from smallest (bar box) to largest (regulation)
 */
export const TABLE_SIZES: readonly TableSizeConfig[] = [
  {
    key: 'bar_box_tables',
    label: '7-Foot',
    infoTitle: '7-Foot (Bar Box)',
    infoContent: 'Standard size found in most bars and casual venues. Playing surface is 7ft x 3.5ft. Also known as "bar box" or "coin-op" tables.',
  },
  {
    key: 'eight_foot_tables',
    label: '8-Foot',
    infoTitle: '8-Foot (Home)',
    infoContent: 'Popular "home table" size. Playing surface is 8ft x 4ft. Larger than bar box but fits in residential spaces better than 9-foot tables.',
  },
  {
    key: 'regulation_tables',
    label: '9-Foot',
    infoTitle: '9-Foot (Tournament)',
    infoContent: 'Professional/regulation size used in tournaments. Playing surface is 9ft x 4.5ft. Also called "big table" or "regulation".',
  },
] as const;

/**
 * Get the display label for a table size key
 * @param key - The table size key (e.g., 'bar_box_tables')
 * @returns The display label (e.g., '7-Foot') or the key if not found
 */
export const getTableSizeLabel = (key: TableSizeKey): string => {
  const config = TABLE_SIZES.find(size => size.key === key);
  return config?.label ?? key;
};

/**
 * Table numbers grouped by size category
 * Used for custom table numbering configurations
 */
export type TableNumbers = {
  bar_box_tables: number[];
  eight_foot_tables: number[];
  regulation_tables: number[];
};

/**
 * Generate default sequential table numbers based on counts
 *
 * Numbers are assigned sequentially across all sizes in the order
 * defined by TABLE_SIZES (7-foot, then 8-foot, then 9-foot).
 *
 * @param values - Object with table counts for each size
 * @returns Object with arrays of table numbers for each size
 *
 * @example
 * generateDefaultTableNumbers({ bar_box_tables: 2, eight_foot_tables: 1, regulation_tables: 2 })
 * // Returns: { bar_box_tables: [1, 2], eight_foot_tables: [3], regulation_tables: [4, 5] }
 */
export function generateDefaultTableNumbers(values: {
  bar_box_tables: number;
  eight_foot_tables: number;
  regulation_tables: number;
}): TableNumbers {
  let currentNum = 1;
  const result: TableNumbers = {
    bar_box_tables: [],
    eight_foot_tables: [],
    regulation_tables: [],
  };

  for (const { key } of TABLE_SIZES) {
    const count = values[key];
    for (let i = 0; i < count; i++) {
      result[key].push(currentNum++);
    }
  }

  return result;
}
