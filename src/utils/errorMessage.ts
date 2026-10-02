/**
 * Helpers for reading a message off a value caught in `catch`.
 *
 * TypeScript types a caught value as `unknown`, and anything can be thrown, so
 * these never assume the value is an `Error` — they read the fields defensively
 * and return `undefined` when there is nothing useful to show.
 */

interface CaughtError {
  message?: string;
  response?: { data?: { message?: string } };
}

const asCaught = (err: unknown) => err as CaughtError | null | undefined;

/** The error's own `message`, if it has one. */
export const errorMessage = (err: unknown): string | undefined =>
  asCaught(err)?.message;

/** An API error's server-provided message, falling back to its own `message`. */
export const apiErrorMessage = (err: unknown): string | undefined =>
  asCaught(err)?.response?.data?.message || asCaught(err)?.message;
