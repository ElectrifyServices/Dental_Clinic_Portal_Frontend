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
  onRemoveXray,
}: ClinicalImagesProps) {
  return (
    <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Clinical Images */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          Clinical Images
        </label>
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted flex flex-col items-center justify-center min-h-[160px]">
          <Camera className="w-8 h-8 text-muted-foreground/60 mb-2" />
          <p className="text-xs text-muted-foreground mb-3">
            Upload clinical photos or other relevant images
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
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary cursor-pointer inline-flex items-center shadow-md text-xs font-bold gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload Images
          </label>
        </div>

        {images.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Uploaded Images:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-border shadow-sm">
                  <img
                    src={image}
                    alt={`Clinical ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="absolute top-1.5 right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* X-Ray Files Section */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          Add File X-Ray
        </label>
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted flex flex-col items-center justify-center min-h-[160px]">
          <Camera className="w-8 h-8 text-muted-foreground/60 mb-2" />
          <p className="text-xs text-muted-foreground mb-3">
            Upload patient X-ray films
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onXrayUpload}
            className="hidden"
            id="xray-upload"
          />
          <label
            htmlFor="xray-upload"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary cursor-pointer inline-flex items-center shadow-md text-xs font-bold gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload X-Ray
          </label>
        </div>

        {xrayFiles.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Uploaded X-Rays:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {xrayFiles.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-border shadow-sm"
                >
                  <img
                    src={url}
                    alt={`X-Ray ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveXray(idx)}
                    className="absolute top-1.5 right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
