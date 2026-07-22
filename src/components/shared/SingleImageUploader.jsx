import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import api from '../../api/axiosConfig';

const getImageUrl = (url) => url?.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')}${url}` : url;

export default function SingleImageUploader({ value, onChange }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      
      const response = await api.post('/api/uploads/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const uploadedUrl = response.data.urls?.[0];
      if (uploadedUrl) {
        onChange(uploadedUrl);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="mt-1.5 w-full">
      {value ? (
        <div className="relative group rounded-xl border border-[var(--border-color)] overflow-hidden aspect-video bg-transparent dark:bg-white/5 flex items-center justify-center">
          <img src={getImageUrl(value)} alt="Uploaded" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              type="button" 
              onClick={handleRemove}
              className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-[var(--color-primary)]/10 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed border-[var(--border-color)]' : 'border-[var(--color-primary)]/50 bg-[var(--bg-base)] text-[var(--color-primary)]'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 className="w-8 h-8 mb-3 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 mb-3 opacity-80" />
            )}
            <p className="mb-2 text-sm text-[var(--text-main)]">
              {isUploading ? 'Uploading...' : <><span className="font-semibold">Click to upload</span> image</>}
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload} 
            disabled={isUploading} 
          />
        </label>
      )}
    </div>
  );
}

