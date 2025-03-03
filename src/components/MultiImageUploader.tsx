import React, { useState } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface MultiImageUploaderProps {
  imageUrls: string[];
  onImageUrlsChange: (urls: string[]) => void;
  onError?: (error: string) => void;
  folderName?: string;
  maxSizeMB?: number;
}

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  imageUrls,
  onImageUrlsChange,
  onError,
  folderName = 'experience-images',
  maxSizeMB = 5
}) => {
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

  const handleAddImageUrl = () => {
    onImageUrlsChange([...imageUrls, '']);
  };

  const handleRemoveImageUrl = (index: number) => {
    const updatedUrls = [...imageUrls];
    updatedUrls.splice(index, 1);
    onImageUrlsChange(updatedUrls);
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = value;
    onImageUrlsChange(updatedUrls);
  };

  const handleUploadImage = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageUploader(true);
  };

  const handleImageUploaded = (url: string) => {
    if (currentImageIndex !== null) {
      const updatedUrls = [...imageUrls];
      updatedUrls[currentImageIndex] = url;
      onImageUrlsChange(updatedUrls);
      setShowImageUploader(false);
      setCurrentImageIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Images
        </label>
        <button
          type="button"
          onClick={handleAddImageUrl}
          className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Another Image
        </button>
      </div>

      {imageUrls.map((url, index) => (
        <div key={index} className="flex items-center mb-2">
          <div className="flex-grow mr-2">
            <div className="flex items-center">
              <input
                type="url"
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required={index === 0}
              />
              <button
                type="button"
                onClick={() => handleUploadImage(index)}
                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md flex items-center"
                title="Upload image"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
            {url && (
              <div className="mt-1 h-16 w-full">
                <img 
                  src={url} 
                  alt={`Preview ${index + 1}`} 
                  className="h-full object-cover rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>
          {index > 0 && (
            <button
              type="button"
              onClick={() => handleRemoveImageUrl(index)}
              className="text-red-600 hover:text-red-900"
              title="Remove image"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}

      {/* Image Upload Modal */}
      {showImageUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Upload Image</h2>
            
            <ImageUploader 
              onImageUploaded={handleImageUploaded}
              onError={onError}
              folderName={folderName}
              maxSizeMB={maxSizeMB}
            />
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowImageUploader(false)}
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiImageUploader;