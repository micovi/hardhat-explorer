// This file dynamically imports the correct feature configuration
// based on the BUILD_VARIANT environment variable at build time
// Default to opensource if not specified

// @ts-ignore - Build-time replacement
const buildVariant = import.meta.env.VITE_BUILD_VARIANT || 'opensource';

// For build-time static imports, we'll use opensource as default
// In production builds, this can be controlled via VITE_BUILD_VARIANT env var
import { FEATURES as OPENSOURCE_FEATURES } from './features.opensource';
import { FEATURES as PRIVATE_FEATURES } from './features.private';

export const FEATURES = buildVariant === 'private' ? PRIVATE_FEATURES : OPENSOURCE_FEATURES;
export type Features = typeof FEATURES;