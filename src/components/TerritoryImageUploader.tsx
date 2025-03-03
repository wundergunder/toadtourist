import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Upload, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface TerritoryImageUploaderProps {
  currentImageUrl: string;
  onImageUploaded: (url: string) => void;
  onError?: (error: string) => void;
}

const TerritoryImageUploader: React.FC<TerritoryImageUploaderProps> = ({ 
  currentImageUrl,
  onImageUploaded, 
  onError 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Please select an image file (JPEG, PNG, etc.)';
      setUploadError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'Image size must be less than 5MB';
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
      const filePath = `territory-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
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
        .from('images')
        .getPublicUrl(filePath);

      // Call the callback with the URL
      onImageUploaded(publicUrl);
      setUploadSuccess(true);
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setUploadError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col items-center">
        {/* Current image preview */}
        {currentImageUrl && (
          <div className="mb-4 w-full max-w-md">
            <img 
              src={currentImageUrl} 
              alt="Territory" 
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
              }}
            />
          </div>
        )}
        
        {/* Upload button */}
        <label className="flex flex-col items-center justify-center w-full max-w-md p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors cursor-pointer">
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
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload a new image</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</span>
              </>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            accept="image/*"
          />
        </label>
      </div>
      
      {uploadError && (
        <div className="mt-2 text-red-600 text-sm flex items-start">
          <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};

export default TerritoryImageUploader;