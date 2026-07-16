import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
  onImageUpload,
  onRemoveImage,
}: ClinicalImagesProps) {
  return (
    <div className="px-6">
      {/* Clinical Images */}
      <div className="space-y-2">
        <Label className="block text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          Clinical Images
        </Label>
        
        <div className="border-2 border-dashed border-border rounded-xl p-4 bg-muted min-h-[160px] flex flex-col justify-center">
          <Input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={onImageUpload}
            className="hidden"
            id="image-upload"
          />
          
          {images.length === 0 ? (
            <div className="text-center flex flex-col items-center justify-center py-4">
              <Camera className="w-8 h-8 text-muted-foreground/60 mb-2" />
              <p className="text-xs text-muted-foreground mb-3">
                Upload clinical photos or other relevant images
              </p>
              <Label
                htmlFor="image-upload"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary cursor-pointer inline-flex items-center shadow-md text-xs font-bold gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload Images
              </Label>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-border shadow-sm bg-card">
                  <img
                    src={image}
                    alt={`Clinical ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="absolute top-1.5 right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:bg-destructive shadow-md opacity-0 group-hover:opacity-100 transition-opacity p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {/* Mini upload button inside the grid */}
              <Label
                htmlFor="image-upload"
                className="relative aspect-square rounded-xl overflow-hidden border border-dashed border-border hover:border-primary/50 bg-card flex flex-col items-center justify-center cursor-pointer transition-all gap-1 text-muted-foreground hover:text-primary"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-bold">Add More</span>
              </Label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
