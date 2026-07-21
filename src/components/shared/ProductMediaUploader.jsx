import React from 'react';
import { X, Upload, Star, Video, ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ProductMediaUploader = ({ 
  thumbnailIndex, 
  setThumbnailIndex,
  hasVideo, 
  pendingVideo, 
  existingVideoUrl, 
  handleVideoSelect, 
  removeVideo,
  combinedScreenshots,
  existingScreenshotsLength,
  pendingScreenshots,
  removeExistingScreenshot,
  removePendingScreenshot,
  handleScreenshotSelect
}) => {
  return (
    <div className="flex flex-col gap-6 mt-2">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-[var(--text-main)]">Media Files</h2>
        <div className="flex-1 h-px bg-[var(--border-color)]"></div>
      </div>
      
      {/* Demo Video */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[var(--text-main)]">Product Video</h3>
        <p className="text-xs text-[var(--text-muted)]">Upload a demo/showcase video.</p>
        
        {hasVideo ? (
          <div className="flex items-center gap-3 bg-[var(--bg-base)] px-4 py-3 rounded-xl border border-[var(--border-color)] shadow-sm">
            <Video size={20} className="text-[var(--color-primary)]" />
            <span className="text-sm text-[var(--text-main)] font-medium truncate flex-1">
              {pendingVideo ? (
                  <span className="text-[var(--color-warning)]">📎 {pendingVideo.file.name} (pending upload)</span>
              ) : existingVideoUrl}
            </span>
            <input type="file" id="videoSelect" accept="video/*" className="hidden" onChange={handleVideoSelect} />
            <label htmlFor="videoSelect" className="cursor-pointer text-sm font-medium text-[var(--color-primary)] hover:underline">Change</label>
            <button type="button" className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors" onClick={removeVideo}><X size={16} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2 max-w-lg">
            <input type="file" id="videoSelect" accept="video/*" className="hidden" onChange={handleVideoSelect} />
            <label htmlFor="videoSelect" className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors text-sm font-medium">
              <Upload size={16} /> Select Video
            </label>
          </div>
        )}
      </div>

      {/* Project Images Gallery */}
      <div className="flex flex-col gap-3 pt-6 border-t border-[var(--border-color)]/50">
        <h3 className="text-sm font-semibold text-[var(--text-main)]">Product Images Gallery</h3>
        <p className="text-xs text-[var(--text-muted)] mb-2">
          Select images locally. Click the ★ star to set as thumbnail.
        </p>
        
        <div className="flex flex-col gap-4">
          {combinedScreenshots.map((item) => {
            const isThumbnail = item.index === thumbnailIndex;
            return (
              <div key={`${item.type}-${item.index}`} className={cn(
                "flex items-center gap-4 p-3 border rounded-2xl transition-all shadow-sm",
                isThumbnail ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/30" : "bg-[var(--bg-base)] border-[var(--border-color)] hover:border-[var(--color-primary)]/30"
              )}>
                
                <button 
                  type="button"
                  onClick={() => setThumbnailIndex(item.index)}
                  className={cn(
                    "flex flex-col items-center justify-center w-14 h-14 rounded-xl border transition-colors",
                    isThumbnail ? "bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)] shadow-inner" : "bg-[var(--bg-panel-hover)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/50"
                  )}
                  title={isThumbnail ? "Primary Thumbnail" : "Set as Thumbnail"}
                >
                  <Star size={20} className={isThumbnail ? 'fill-current' : ''} />
                  <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Thumb</span>
                </button>

                {/* Preview */}
                <img src={item.url} alt="" className="w-24 h-24 sm:w-32 sm:h-20 object-cover rounded-xl border border-[var(--border-color)] shadow-sm shrink-0" />

                <div className="flex-1 min-w-0 flex flex-col gap-1 justify-center">
                  <span className="text-sm font-medium truncate text-[var(--text-main)]" title={item.type === 'existing' ? item.url : ''}>
                    {item.type === 'existing' ? `.../${item.url.split('/').pop()}` : `📎 ${pendingScreenshots[item.index - existingScreenshotsLength]?.file.name}`}
                  </span>
                  <span className={cn(
                    "text-[11px] font-bold uppercase tracking-wider",
                    item.type === 'pending' ? "text-[var(--color-warning)]" : "text-green-500"
                  )}>
                    {item.type === 'pending' ? 'Pending upload' : 'Uploaded'}
                  </span>
                </div>

                <button type="button" onClick={() => {
                  if (item.type === 'existing') removeExistingScreenshot(item.index);
                  else removePendingScreenshot(item.index - existingScreenshotsLength);
                }} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <input type="file" id="screenshotSelect" accept="image/*" multiple className="hidden" onChange={handleScreenshotSelect} />
          <label htmlFor="screenshotSelect" className="cursor-pointer flex items-center gap-2 text-sm font-semibold px-5 py-2.5 border-2 border-dashed border-[var(--color-primary)]/50 text-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary)]/10 transition-colors">
            <ImageIcon size={16} /> Add Images
          </label>
        </div>
      </div>
    </div>
  );
};
