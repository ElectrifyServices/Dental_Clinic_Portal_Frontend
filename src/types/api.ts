/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Shared permissive types for API payloads whose exact shape is not yet modelled.
 *
 * These are a deliberate, centralised escape hatch so that `any` does not have to be
 * sprinkled across every hook. Behaviour is identical to `any` — nothing changes at
 * runtime. As real response interfaces get written, replace usages one by one.
 */

/** A value coming from / going to the API whose shape is not modelled yet. */
export type ApiAny = any;

/** An object from / to the API whose keys are not fully modelled yet. */
export type ApiRecord = Record<string, any>;
