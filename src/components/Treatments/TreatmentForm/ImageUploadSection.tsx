import React from 'react';
import { Camera, X } from 'lucide-react';

interface ImageUploadSectionProps {
  images: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

export function ImageUploadSection({ images, onUpload, onRemove }: ImageUploadSectionProps) {
  return (
    <div>
      <label className="form-label text-gray-700 mb-3 flex items-center gap-2">
        <Camera className="w-4 h-4 text-blue-600" />
        Treatment Images
      </label>
      <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 hover:border-blue-300 transition-all group">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Camera className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <p className="text-sm font-bold text-gray-900">Drop images here or click to upload</p>
        <p className="text-xs text-gray-500 mt-1 mb-4">Upload before/after images, X-rays, or other relevant photos</p>
        
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onUpload}
          className="hidden"
          id="treatment-image-upload"
        />
        <label
          htmlFor="treatment-image-upload"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer font-bold text-sm shadow-md shadow-blue-100 transition-all active:scale-95"
        >
          <Camera className="w-4 h-4" />
          Select Images
        </label>
      </div>

      {images.length > 0 && (
        <div className="mt-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Uploaded Images ({images.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square group">
                <img
                  src={image}
                  alt={`Treatment ${index + 1}`}
                  className="w-full h-full object-cover rounded-2xl border border-gray-100 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-lg w-7 h-7 flex items-center justify-center shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
