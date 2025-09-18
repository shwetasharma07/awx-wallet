import { v4 as uuidv4 } from 'uuid';

// Global store for tracking idempotency keys in the current request context
const idempotencyStore = new Map<string, string>();

export function mkId(): string {
  return uuidv4();
}

export function requireIdempotency(operationKey?: string): string {
  // Use the operation key or a default key for the current context
  const key = operationKey || 'default';

  // Check if we already have an idempotency key for this operation
  if (idempotencyStore.has(key)) {
    return idempotencyStore.get(key)!;
  }

  // Generate a new idempotency key and store it
  const idempotencyKey = mkId();
  idempotencyStore.set(key, idempotencyKey);

  return idempotencyKey;
}

// Helper function to clear idempotency keys (useful for testing or cleanup)
export function clearIdempotencyKeys(): void {
  idempotencyStore.clear();
}

// Helper function to get all current idempotency keys (useful for debugging)
export function getIdempotencyKeys(): Record<string, string> {
  return Object.fromEntries(idempotencyStore.entries());
}