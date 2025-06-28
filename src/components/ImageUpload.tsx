import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import apiClient from '@/services/api';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
  placeholder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  className = '',
  placeholder = 'Upload or paste image URL'
}) => {
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [previewImage, setPreviewImage] = useState(currentImage || '');

  // Handle file upload to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/upload/shop-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.status === 'success') {
      return response.data.data.url;
    } else {
      throw new Error(response.data.message || 'Upload failed');
    }
  };

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      const imageUrl = await uploadToCloudinary(file);
      setPreviewImage(imageUrl);
      onImageChange(imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onImageChange]);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  // Handle URL input
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    try {
      // Basic URL validation
      new URL(urlInput);
      setPreviewImage(urlInput);
      onImageChange(urlInput);
      setUrlInput('');
    } catch (error) {
      alert('Please enter a valid URL');
    }
  };

  // Clear image
  const clearImage = () => {
    setPreviewImage('');
    onImageChange('');
    setUrlInput('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mode Toggle */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => setUploadMode('upload')}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            uploadMode === 'upload'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Upload size={16} className="mr-2" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            uploadMode === 'url'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <LinkIcon size={16} className="mr-2" />
          Image URL
        </button>
      </div>

      {/* Preview Image */}
      {previewImage && (
        <div className="relative inline-block">
          <img
            src={previewImage}
            alt="Preview"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Shop&size=80&background=10b981&color=white`;
            }}
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Upload Mode */}
      {uploadMode === 'upload' && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-green-600 mb-2" size={32} />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="text-gray-400 mb-2" size={32} />
              {isDragActive ? (
                <p className="text-sm text-green-600">Drop the image here...</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Drag & drop an image here, or <span className="text-green-600 font-medium">browse</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* URL Mode */}
      {uploadMode === 'url' && (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlSubmit();
                }
              }}
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500">
            You can use images from Unsplash, your website, or any public image URL
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
