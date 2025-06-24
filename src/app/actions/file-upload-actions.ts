import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export interface FileUploadResult {
  success: boolean;
  message: string;
  url?: string;
}

// This function must only be used on the client!
export async function uploadSupportingDocument(file: File): Promise<FileUploadResult> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: 'File size must be less than 10MB'
      };
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        success: false,
        message: 'File must be a PDF or Word document'
      };
    }

    // Get file extension
    const extension = file.name.split('.').pop() || '';
    
    // Generate unique filename
    const fileName = `supporting-docs/${uuidv4()}.${extension}`;
    
    // Get storage reference
    const fileRef = ref(storage, fileName);
    
    // Upload file
    const buffer = await file.arrayBuffer();
    await uploadBytes(fileRef, buffer, {
      contentType: file.type
    });
    
    // Get download URL
    const downloadUrl = await getDownloadURL(fileRef);

    return {
      success: true,
      message: 'File uploaded successfully',
      url: downloadUrl
    };
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      message: `Error uploading file: ${error.message}`
    };
  }
}
