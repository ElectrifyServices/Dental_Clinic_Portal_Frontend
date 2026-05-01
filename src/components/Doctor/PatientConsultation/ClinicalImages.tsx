import React from "react";
import { Camera, Plus, X } from "lucide-react";

interface ClinicalImagesProps {
  images: string[];
  xrayFiles: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onXrayUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onRemoveXray: (index: number) => void;
}

export function ClinicalImages({
  images,
  xrayFiles,
  onImageUpload,
  onXrayUpload,
  onRemoveImage,
  onRemoveXray
}: ClinicalImagesProps) {
  return (
    <div className="px-6 space-y-6">
      {/* Clinical Images */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Camera className="w-4 h-4 inline mr-2" />
          Clinical Images
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">
            Upload clinical photos, X-rays, or other relevant images
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center shadow-md"
          >
            <Camera className="w-4 h-4 mr-2" />
            Upload Images
          </label>
        </div>

        {images.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Images:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Clinical ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl border border-gray-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* X-Ray Files Section */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center">
            <Camera className="w-4 h-4 mr-2 text-blue-600" />
            Add File X-Ray
          </label>
          <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md">
            <Plus className="w-3 h-3" /> Upload X-Ray
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onXrayUpload}
              className="hidden"
            />
          </label>
        </div>

        {xrayFiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {xrayFiles.map((url, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-white shadow-md">
                <img src={url} alt={`X-Ray ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemoveXray(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No X-ray files uploaded</p>
        )}
      </div>
    </div>
  );
}
