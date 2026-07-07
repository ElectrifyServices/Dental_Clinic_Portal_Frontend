import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
﻿import React from 'react';
import { Camera, X, Plus } from 'lucide-react';

interface ImageUploadSectionProps {
  images: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

export function ImageUploadSection({ images, onUpload, onRemove }: ImageUploadSectionProps) {
  return (
    <div>
      <Label className="form-label text-muted-foreground mb-3 flex items-center gap-2">
        <Camera className="w-4 h-4 text-primary" />
        Treatment Images
      </Label>
      <div className="border-2 border-dashed border-border rounded-3xl p-6 bg-muted/50 hover:bg-muted hover:border-primary/50 transition-all group relative min-h-[200px] flex flex-col justify-center">
        {images.length > 0 ? (
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Uploaded Images ({images.length})</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square group/img">
                  <img
                    src={image}
                    alt={`Treatment ${index + 1}`}
                    className="w-full h-full object-cover rounded-2xl border border-border shadow-sm"
                  />
                  <Button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="absolute -top-1.5 -right-1.5 bg-destructive/100 text-white rounded-lg w-7 h-7 flex items-center justify-center shadow-lg hover:bg-destructive transition-all opacity-0 group-hover/img:opacity-100 scale-90 group-hover/img:scale-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <Label
                htmlFor="treatment-image-upload"
                className="aspect-square rounded-2xl border-2 border-dashed border-border/80 flex flex-col items-center justify-center cursor-pointer hover:bg-card transition-colors text-muted-foreground hover:text-primary hover:border-primary/50 bg-background/50"
              >
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">Add More</span>
              </Label>
            </div>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={onUpload}
              className="hidden"
              id="treatment-image-upload"
            />
          </div>
        ) : (
          <div className="text-center w-full py-4">
            <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center shadow-sm border border-border mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8 text-muted-foreground/60 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-sm font-bold text-foreground">Drop images here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Upload before/after images, X-rays, or other relevant photos</p>
            
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={onUpload}
              className="hidden"
              id="treatment-image-upload"
            />
            <Label
              htmlFor="treatment-image-upload"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary cursor-pointer font-bold text-sm shadow-md shadow-blue-100 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              Select Images
            </Label>
          </div>
        )}
      </div>
    </div>
  );
}
