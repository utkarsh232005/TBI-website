-- Migration: Add Domain, Sector, and Legal Status fields to applicants table
-- Date: 2025-06-25
-- Description: Extends the applicants table with three new required dropdown fields

-- Add the three new columns to the applicants table
ALTER TABLE applicants 
ADD COLUMN domain VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN sector VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN legal_status VARCHAR(100) NOT NULL DEFAULT '';

-- Add constraints to ensure only valid values are stored
ALTER TABLE applicants 
ADD CONSTRAINT chk_domain CHECK (domain IN (
    'HealthTech', 'EdTech', 'FinTech', 'AgriTech', 'FoodTech', 
    'E-commerce', 'SaaS', 'IoT', 'AI/ML', 'CleanTech'
));

ALTER TABLE applicants 
ADD CONSTRAINT chk_sector CHECK (sector IN (
    'Technology', 'Healthcare', 'Education', 'Financial Services', 
    'Manufacturing', 'Retail', 'Agriculture', 'Food & Beverage', 
    'Real Estate', 'Consulting'
));

ALTER TABLE applicants 
ADD CONSTRAINT chk_legal_status CHECK (legal_status IN (
    'MSME SSI', 'LLP', 'Pvt. Ltd.', 'Proprietorship', 
    'Gumasta', 'Family Owned Business', 'Not registered'
));

-- Create indexes for better query performance
CREATE INDEX idx_applicants_domain ON applicants(domain);
CREATE INDEX idx_applicants_sector ON applicants(sector);
CREATE INDEX idx_applicants_legal_status ON applicants(legal_status);

-- Create composite index for common filtering scenarios
CREATE INDEX idx_applicants_domain_sector ON applicants(domain, sector);

-- Remove default empty string constraint after data migration
-- (Run this after updating existing records)
-- ALTER TABLE applicants 
-- ALTER COLUMN domain DROP DEFAULT,
-- ALTER COLUMN sector DROP DEFAULT,
-- ALTER COLUMN legal_status DROP DEFAULT;

-- Update existing records with default values (customize as needed)
-- UPDATE applicants 
-- SET domain = 'Technology', 
--     sector = 'Technology', 
--     legal_status = 'Not registered' 
-- WHERE domain = '' OR sector = '' OR legal_status = '';

COMMIT;
