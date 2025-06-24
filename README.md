# RCOEM-TBI

This is a NextJS starter webapp.

## Setup Instructions

1. **Configure Firebase Storage CORS**

   After cloning, run:

   ```sh
   npm run configure-cors
   ```
   (Requires `gsutil` and Firebase CLI. Make sure your bucket name matches your project.)

2. **Start the Dev Server**

   ```sh
   npm run dev
   ```

3. **Test the Form**

   - Fill out all required fields (including the new dropdowns for Domain, Sector, Legal Status).
   - Upload a file and submit. The file should upload reliably and the record should appear in Firestore.

For more, see `src/app/page.tsx`.
