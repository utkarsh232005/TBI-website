// MongoDB Migration: Add Domain, Sector, and Legal Status fields
// Date: 2025-06-25
// Description: Extends the ContactSubmission collection with three new required fields

// Connect to your MongoDB database
use('tbi-website'); // Replace with your actual database name

// Update the existing documents to include the new fields with default values
db.ContactSubmission.updateMany(
  { 
    // Match documents that don't have the new fields
    $or: [
      { domain: { $exists: false } },
      { sector: { $exists: false } },
      { legalStatus: { $exists: false } }
    ]
  },
  {
    $set: {
      domain: "Technology", // Default value
      sector: "Technology", // Default value
      legalStatus: "Not registered" // Default value
    }
  }
);

// Create indexes for better query performance
db.ContactSubmission.createIndex({ "domain": 1 });
db.ContactSubmission.createIndex({ "sector": 1 });
db.ContactSubmission.createIndex({ "legalStatus": 1 });

// Create compound index for common filtering scenarios
db.ContactSubmission.createIndex({ "domain": 1, "sector": 1 });

// Create validation schema for the collection (optional but recommended)
db.runCommand({
  collMod: "ContactSubmission",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      properties: {
        domain: {
          bsonType: "string",
          enum: ["HealthTech", "EdTech", "FinTech", "AgriTech", "FoodTech", "E-commerce", "SaaS", "IoT", "AI/ML", "CleanTech"],
          description: "must be a valid domain option"
        },
        sector: {
          bsonType: "string", 
          enum: ["Technology", "Healthcare", "Education", "Financial Services", "Manufacturing", "Retail", "Agriculture", "Food & Beverage", "Real Estate", "Consulting"],
          description: "must be a valid sector option"
        },
        legalStatus: {
          bsonType: "string",
          enum: ["MSME SSI", "LLP", "Pvt. Ltd.", "Proprietorship", "Gumasta", "Family Owned Business", "Not registered"],
          description: "must be a valid legal status option"
        }
      }
    }
  },
  validationLevel: "moderate", // Only validate inserts and updates
  validationAction: "warn" // Log warnings instead of rejecting documents
});

print("Migration completed successfully!");
print("Updated documents with new fields and created indexes.");
