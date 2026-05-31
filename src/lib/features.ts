// Feature flags for soft-hiding work-in-progress sections without removing
// code. Flip a flag to `true` when the section is ready to ship; the gating
// then evaporates.
export const FEATURES = {
  blog: true,
} as const;

export type Feature = keyof typeof FEATURES;
