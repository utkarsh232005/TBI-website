/**
 * Reusable Image Upload Component
 * 
 * This component provides a consistent interface for image uploads across the application.
 * It handles file selection, preview, upload, and error states.
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uploadImage, ImageUploadResult, ImageUploadOptions, isBase64Image } from '@/lib/image-upload';

interface ImageUploadComponentProps {
  value?: string; // Current image URL/Base64
  onChange: (imageUrl: string | null) => void;
  onUploadComplete?: (result: ImageUploadResult) => void;
  options?: ImageUploadOptions;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  previewClassName?: string;
  dropzoneText?: string;
  maxFiles?: number;
}

interface UploadState {
  isUploading: boolean;
  error: string | null;
  success: boolean;
}

export const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  value,
  onChange,
  onUploadComplete,
  options,
  placeholder = "Click to upload or drag and drop",
  className,
  disabled = false,
  showPreview = true,
  previewClassName,
  dropzoneText,
  maxFiles = 1,
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    error: null,
    success: false,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; // For now, handle single file

    setUploadState({
      isUploading: true,
      error: null,
      success: false,
    });

    try {
      const result = await uploadImage(file, options);

      if (result.success && result.url) {
        onChange(result.url);
        onUploadComplete?.(result);
        setUploadState({
          isUploading: false,
          error: null,
          success: true,
        });

        // Clear success state after 2 seconds
        setTimeout(() => {
          setUploadState(prev => ({ ...prev, success: false }));
        }, 2000);
      } else {
        setUploadState({
          isUploading: false,
          error: result.error || 'Upload failed',
          success: false,
        });
      }
    } catch (error) {
      setUploadState({
        isUploading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      });
    }
  }, [onChange, onUploadComplete, options]);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event.target.files);
  }, [handleFileUpload]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    handleFileUpload(event.dataTransfer.files);
  }, [disabled, handleFileUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemove = useCallback(() => {
    onChange(null);
    setUploadState({
      isUploading: false,
      error: null,
      success: false,
    });
  }, [onChange]);

  const hasImage = value && value.trim() !== '';
  const isBase64 = hasImage && isBase64Image(value);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all duration-200",
          isDragOver ? "border-primary bg-primary/5" : "border-border",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50",
          uploadState.isUploading && "border-blue-400 bg-blue-50/10",
          uploadState.error && "border-red-400 bg-red-50/10",
          uploadState.success && "border-green-400 bg-green-50/10"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!disabled ? handleFileSelect : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
          multiple={maxFiles > 1}
        />

        <div className="p-6 text-center">
          <AnimatePresence mode="wait">
            {uploadState.isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-2"
              >
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-muted-foreground">Processing image...</p>
              </motion.div>
            ) : uploadState.success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-2"
              >
                <Check className="h-8 w-8 text-green-500" />
                <p className="text-sm text-green-600">Upload successful!</p>
              </motion.div>
            ) : uploadState.error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-2"
              >
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p className="text-sm text-red-600">{uploadState.error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadState(prev => ({ ...prev, error: null }));
                  }}
                >
                  Try Again
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {dropzoneText || placeholder}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to {options?.maxSizeBytes ? Math.round(options.maxSizeBytes / 1024 / 1024) : 5}MB
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* URL Input Alternative */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex-1 h-px bg-border"></div>
        <span>or paste URL</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* Preview */}
      {showPreview && hasImage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={cn("relative", previewClassName)}
        >
          <div className="relative group">
            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border bg-card">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';
                }}
              />

              {/* Remove button */}
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Image info */}
            {isBase64 && (
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Base64 image ({Math.round(value.length / 1024)}KB)
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ImageUploadComponent;
