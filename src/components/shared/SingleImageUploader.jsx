import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, RefreshCw, ImageIcon } from 'lucide-react';

// If it's a relative URL from the server, prefix with API base
const getImageUrl = (url) =>
  url?.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')}${url}` : url;

/**
 * SingleImageUploader — Deferred upload design
 *
 * - On file select: shows a local blob preview, calls onChange(File).
 *   No network request happens here.
 * - The parent's onSubmit is responsible for uploading File objects
 *   before sending the payload.
 * - If value is already a string URL (saved image), it's shown directly.
 *
 * Hover UX:
 *   - Dark semi-transparent overlay fades in over the image
 *   - Bottom stripe reveals Re-upload and Remove buttons
 */
export default function SingleImageUploader({ value, onChange }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Generate blob URL when value is a File
  useEffect(() => {
    if (value instanceof File) {
      const blobUrl = URL.createObjectURL(value);
      setPreviewUrl(blobUrl);
      return () => URL.revokeObjectURL(blobUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file); // Pass File — actual upload deferred to onSubmit
    e.target.value = ''; // Reset so same file can be re-selected
  };

  const handleRemove = () => onChange('');

  const triggerReupload = () => fileInputRef.current?.click();

  const displayUrl = value instanceof File ? previewUrl : getImageUrl(value);
  const hasImage = !!displayUrl;
  const isPending = value instanceof File;

  return (
    <div className="mt-1.5 w-full">
      {hasImage ? (
        <div className="group relative rounded-xl border border-[var(--border-color)] overflow-hidden aspect-video bg-[var(--bg-base)] cursor-pointer">
          {/* Image */}
          <img
            src={displayUrl}
            alt="Preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          {/* Pending badge — top left, always visible when unsaved */}
          {isPending && (
            <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow">
              <ImageIcon className="w-3 h-3" />
              Not saved yet
            </div>
          )}

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/40 transition-all duration-300 pointer-events-none" />

          {/* Bottom action strip — slides up on hover */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-2 px-3 py-2.5 bg-black/70 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            {/* Re-upload button */}
            <button
              type="button"
              onClick={triggerReupload}
              className="flex items-center gap-1.5 text-white text-xs font-semibold hover:text-amber-400 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replace
            </button>

            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 text-white text-xs font-semibold hover:text-red-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>

          {/* Hidden file input for re-upload */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--color-primary)]/50 rounded-xl cursor-pointer bg-[var(--bg-base)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 select-none">
            <Upload className="w-7 h-7 mb-2 opacity-80" />
            <p className="text-sm text-[var(--text-main)]">
              <span className="font-semibold">Click to select</span> image
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Uploads when you save the form</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}
