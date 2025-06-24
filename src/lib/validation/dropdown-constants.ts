// Validation constants for dropdown fields
// This file centralizes all dropdown options for easy maintenance

export const DOMAIN_OPTIONS = [
  'HealthTech',
  'EdTech', 
  'FinTech',
  'AgriTech',
  'FoodTech',
  'E-commerce',
  'SaaS',
  'IoT',
  'AI/ML',
  'CleanTech'
] as const;

export const SECTOR_OPTIONS = [
  'Technology',
  'Healthcare',
  'Education', 
  'Financial Services',
  'Manufacturing',
  'Retail',
  'Agriculture',
  'Food & Beverage',
  'Real Estate',
  'Consulting'
] as const;

export const LEGAL_STATUS_OPTIONS = [
  'MSME SSI',
  'LLP',
  'Pvt. Ltd.',
  'Proprietorship',
  'Gumasta',
  'Family Owned Business',
  'Not registered'
] as const;

// Export types for TypeScript validation
export type Domain = typeof DOMAIN_OPTIONS[number];
export type Sector = typeof SECTOR_OPTIONS[number];
export type LegalStatus = typeof LEGAL_STATUS_OPTIONS[number];

// Helper functions for validation
export const isValidDomain = (value: string): value is Domain => {
  return DOMAIN_OPTIONS.includes(value as Domain);
};

export const isValidSector = (value: string): value is Sector => {
  return SECTOR_OPTIONS.includes(value as Sector);
};

export const isValidLegalStatus = (value: string): value is LegalStatus => {
  return LEGAL_STATUS_OPTIONS.includes(value as LegalStatus);
};
