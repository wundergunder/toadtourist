import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Video, Image as ImageIcon } from 'lucide-react';
import MediaUploader from './MediaUploader';

interface Media {
  url: string;
  type: 'image' | 'video';
}

interface MultiMediaUploaderProps {
  media: Media[];
  onMediaChange: (media: Media[]) => void;
  onError?: (error: string) => void;
  folderName?: string;
  maxSizeMB?: number;
}

const MultiMediaUploader: React.FC<MultiMediaUploaderProps> = ({
  media,
  onMediaChange,
  onError,
  folderName = 'experience-media',
  maxSizeMB = 50
}) => {
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number | null>(null);

  const handleAddMedia = () => {
    onMediaChange([...media, { url: '', type: 'image' }]);
  };

  const handleRemoveMedia = (index: number) => {
    const updatedMedia = [...media];
    updatedMedia.splice(index, 1);
    onMediaChange(updatedMedia);
  };

  const handleMediaUrlChange = (index: number, value: string) => {
    const updatedMedia = [...media];
    // Try to determine the type from the URL
    const type = value.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'video';
    updatedMedia[index] = { url: value, type };
    onMediaChange(updatedMedia);
  };

  const handleUploadMedia = (index: number) => {
    setCurrentMediaIndex(index);
    setShowMediaUploader(true);
  };

  const handleMediaUploaded = (url: string, type: 'image' | 'video') => {
    if (currentMediaIndex !== null) {
      const updatedMedia = [...media];
      updatedMedia[currentMediaIndex] = { url, type };
      onMediaChange(updatedMedia);
      setShowMediaUploader(false);
      setCurrentMediaIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Media (Images & Videos)
        </label>
        <button
          type="button"
          onClick={handleAddMedia}
          className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Media
        </button>
      </div>

      {media.map((item, index) => (
        <div key={index} className="flex items-center mb-2">
          <div className="flex-grow mr-2">
            <div className="flex items-center">
              <input
                type="url"
                value={item.url}
                onChange={(e) => handleMediaUrlChange(index, e.target.value)}
                placeholder="https://example.com/media.jpg"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                required={index === 0}
              />
              <button
                type="button"
                onClick={() => handleUploadMedia(index)}
                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md flex items-center"
                title="Upload media"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
            {item.url && (
              <div className="mt-1 h-16 w-full">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={`Preview ${index + 1}`} 
                    className="h-full object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Media+URL';
                    }}
                  />
                ) : (
                  <video 
                    src={item.url}
                    className="h-full rounded-md"
                    onError={(e) => {
                      const video = e.target as HTMLVideoElement;
                      video.poster = 'https://via.placeholder.com/150?text=Invalid+Video+URL';
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-gray-400">
              {item.type === 'image' ? (
                <ImageIcon className="h-5 w-5" />
              ) : (
                <Video className="h-5 w-5" />
              )}
            </div>
            {index > 0 && (
              <button
                type="button"
                onClick={() => handleRemoveMedia(index)}
                className="text-red-600 hover:text-red-900"
                title="Remove media"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Media Upload Modal */}
      {showMediaUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Upload Media</h2>
            
            <MediaUploader 
              onMediaUploaded={handleMediaUploaded}
              onError={onError}
              folderName={folderName}
              maxSizeMB={maxSizeMB}
              acceptedTypes="both"
            />
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaUploader(false)}
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

export default MultiMediaUploader;