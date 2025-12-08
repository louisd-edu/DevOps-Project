import { randomUUID } from 'crypto';

/**
 * Generates a unique share token for private recipe access
 * Uses UUID v4 for cryptographically secure random tokens
 * @returns A UUID v4 string
 */
export function generateShareToken(): string {
	return randomUUID();
}
