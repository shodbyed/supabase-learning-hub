/**
 * @fileoverview Mock Venue Data
 * Fake venue data for testing and development of the league creation wizard
 */

/**
 * Venue information interface
 * Represents a billiard hall/bar where matches can be played
 */
export interface Venue {
  id: string;
  name: string;
  address: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  barBoxTables: number;
  bigTables?: number;
  notes?: string;
  createdAt: string;
  isActive: boolean;
}

/**
 * Mock venues for testing - represents venues that an organization might have
 */
export const mockVenues: Venue[] = [
  {
    id: 'venue_1',
    name: 'Billiards Plaza',
    address: '123 Main St, Phoenix, AZ 85001',
    streetAddress: '123 Main St',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    phone: '(602) 555-0123',
    barBoxTables: 6,
    bigTables: 2,
    notes: 'Popular downtown location with good lighting',
    createdAt: '2024-01-15T10:00:00Z',
    isActive: true
  },
  {
    id: 'venue_2',
    name: 'Corner Pocket Bar & Grill',
    address: '456 Oak Ave, Phoenix, AZ 85002',
    streetAddress: '456 Oak Ave',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85002',
    phone: '(602) 555-0456',
    barBoxTables: 4,
    notes: 'Casual atmosphere, good food',
    createdAt: '2024-02-01T14:30:00Z',
    isActive: true
  }
];

/**
 * Simulates fetching organization venues from database
 * @returns Promise<Venue[]> Array of venues for the organization
 */
export const fetchOrganizationVenues = async (): Promise<Venue[]> => {
  console.log('🔍 Fetching organization venues...');

  // Simulate database call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate different scenarios:
  // 70% chance of having venues, 30% chance of no venues yet
  const hasVenues = Math.random() > 0.3; // Favor having venues for demo
  const venues = hasVenues ? mockVenues : [];

  console.log(`✅ Found ${venues.length} venues for organization`);
  return venues;
};