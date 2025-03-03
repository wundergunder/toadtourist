import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, Video } from 'lucide-react';

interface MediaUploaderProps {
  onMediaUploaded: (url: string, type: 'image' | 'video') => void;
  onError?: (error: string) => void;
  folderName?: string;
  maxSizeMB?: number;
  acceptedTypes?: 'image' | 'video' | 'both';
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  onMediaUploaded, 
  onError,
  folderName = 'experience-media',
  maxSizeMB = 50,
  acceptedTypes = 'both'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptedFileTypes = () => {
    switch (acceptedTypes) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'both':
      default:
        return 'image/*,video/*';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    // Validate file type
    if (!isImage && !isVideo) {
      const errorMsg = 'Please select an image or video file';
      setUploadError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    if (acceptedTypes === 'image' && !isImage) {
      const errorMsg = 'Please select an image file (JPEG, PNG, etc.)';
      setUploadError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    if (acceptedTypes === 'video' && !isVideo) {
      const errorMsg = 'Please select a video file (MP4, WebM, etc.)';
      setUploadError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }
    
    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = `File size must be less than ${maxSizeMB}MB`;
      setUploadError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${folderName}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          }
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Call the callback with the URL and media type
      onMediaUploaded(publicUrl, isImage ? 'image' : 'video');
      setUploadSuccess(true);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      setUploadError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={getAcceptedFileTypes()}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors"
      >
        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <div className="mb-2 relative h-10 w-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                  {uploadProgress}%
                </div>
              </div>
              <span className="text-sm text-gray-500">Uploading...</span>
            </>
          ) : uploadSuccess ? (
            <>
              <Check className="h-10 w-10 text-green-500 mb-2" />
              <span className="text-sm text-green-600">Upload successful!</span>
            </>
          ) : (
            <>
              <div className="flex space-x-2 mb-2">
                <ImageIcon className="h-10 w-10 text-gray-400" />
                {acceptedTypes !== 'image' && (
                  <Video className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <span className="text-sm text-gray-500">Click to upload {acceptedTypes === 'both' ? 'media' : acceptedTypes}</span>
              <span className="text-xs text-gray-400 mt-1">
                {acceptedTypes === 'image' && 'PNG, JPG, GIF'}
                {acceptedTypes === 'video' && 'MP4, WebM, MOV'}
                {acceptedTypes === 'both' && 'Images (PNG, JPG, GIF) or Videos (MP4, WebM, MOV)'}
                {` up to ${maxSizeMB}MB`}
              </span>
            </>
          )}
        </div>
      </button>
      
      {uploadError && (
        <div className="mt-2 text-red-600 text-sm flex items-start">
          <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;