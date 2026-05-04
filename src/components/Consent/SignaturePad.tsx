import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Upload, MousePointer2 } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  defaultValue?: string;
}

export function SignaturePad({ onSave, defaultValue }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(!!defaultValue);
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && defaultValue) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
          const x = (canvas.width / 2) - (img.width / 2) * scale;
          const y = (canvas.height / 2) - (img.height / 2) * scale;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
      };
      img.src = defaultValue;
    }
  }, [defaultValue, mode]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'draw') return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (mode !== 'draw') return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
      onSave(canvas.toDataURL());
      setHasSigned(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a8a';

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      onSave('');
      setHasSigned(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onSave(dataUrl);
        setHasSigned(true);
        
        // Draw to canvas for preview
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              // Calculate scaling to fit within canvas while maintaining aspect ratio
              const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
              const x = (canvas.width / 2) - (img.width / 2) * scale;
              const y = (canvas.height / 2) - (img.height / 2) * scale;
              ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            }
          };
          img.src = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            mode === 'draw' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MousePointer2 className="w-3.5 h-3.5" />
          Draw
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            mode === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
      </div>

      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-40 bg-white border-2 border-dashed border-gray-200 rounded-[2rem] transition-all ${
            mode === 'draw' ? 'cursor-crosshair active:border-blue-300' : 'cursor-default opacity-50'
          }`}
        />
        
        {mode === 'upload' && !hasSigned && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Select Signature File
            </button>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">PNG, JPG or SVG allowed</p>
          </div>
        )}

        {!hasSigned && mode === 'draw' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-300">
            <span className="text-sm font-bold uppercase tracking-widest">Sign here with mouse/touch</span>
          </div>
        )}

        {hasSigned && (
          <button
            type="button"
            onClick={clearCanvas}
            className="absolute top-4 right-4 p-2.5 bg-white rounded-xl shadow-lg text-gray-400 hover:text-red-500 transition-all border border-gray-100"
            title="Clear Signature"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
