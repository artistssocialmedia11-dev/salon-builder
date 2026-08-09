import React, { useState, useEffect, useRef } from "react";
import { X, ZoomIn, ZoomOut, Check, Move, Grid, RefreshCw, Trash2, Upload } from "lucide-react";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  imageType: "logo" | "banner" | "gallery" | "team" | "testimonial" | "gallery-edit";
  onCrop: (croppedDataUrl: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onReplace?: (file: File) => void;
}

type AspectRatioPreset = {
  label: string;
  value: number; // width / height
  id: string;
};

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  imageType,
  onCrop,
  onCancel,
  onDelete,
  onReplace,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Crop settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>({ label: "Square (1:1)", value: 1, id: "1:1" });
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270

  // Container and canvas sizing
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Load image element
  useEffect(() => {
    if (!imageSrc) return;
    setLoading(true);
    setError(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImgElement(img);
      setLoading(false);
    };
    img.onerror = () => {
      setError("Failed to load image. Please try a different photo.");
      setLoading(false);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Handle aspect ratio presets based on imageType
  useEffect(() => {
    if (imageType === "logo" || imageType === "team" || imageType === "testimonial") {
      setAspectRatio({ label: "Square (1:1)", value: 1, id: "1:1" });
    } else if (imageType === "banner") {
      setAspectRatio({ label: "Banner (16:9)", value: 16 / 9, id: "16:9" });
    } else {
      // Default for gallery: 4:3 but allow changing
      setAspectRatio({ label: "Photo (4:3)", value: 4 / 3, id: "4:3" });
    }
  }, [imageType]);

  // Monitor viewport container resizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(containerRef.current);
    updateSize();

    return () => observer.disconnect();
  }, [isOpen, aspectRatio]);

  if (!isOpen) return null;

  // Predefined Aspect Ratio presets (for gallery/general)
  const presets: AspectRatioPreset[] = [
    { label: "Square (1:1)", value: 1, id: "1:1" },
    { label: "Photo (4:3)", value: 4 / 3, id: "4:3" },
    { label: "Classic (3:2)", value: 3 / 2, id: "3:2" },
    { label: "Widescreen (16:9)", value: 16 / 9, id: "16:9" },
    { label: "Cinematic (21:9)", value: 21 / 9, id: "21:9" },
  ];

  // Dimensions of the crop box inside the viewport
  const maxCropWidth = containerSize.width ? containerSize.width * 0.9 : 300;
  const maxCropHeight = containerSize.height ? containerSize.height * 0.8 : 300;

  let cropWidth = maxCropWidth;
  let cropHeight = maxCropWidth / aspectRatio.value;

  if (cropHeight > maxCropHeight) {
    cropHeight = maxCropHeight;
    cropWidth = maxCropHeight * aspectRatio.value;
  }

  // Calculate scaling and offsets
  let imgNaturalWidth = imgElement?.naturalWidth || 1;
  let imgNaturalHeight = imgElement?.naturalHeight || 1;

  // If rotated by 90 or 270 degrees, swap natural width and height
  const isRotated90or270 = rotation === 90 || rotation === 270;
  if (isRotated90or270) {
    const temp = imgNaturalWidth;
    imgNaturalWidth = imgNaturalHeight;
    imgNaturalHeight = temp;
  }

  const baseScale = Math.max(cropWidth / imgNaturalWidth, cropHeight / imgNaturalHeight);
  const currentWidth = imgNaturalWidth * baseScale * zoom;
  const currentHeight = imgNaturalHeight * baseScale * zoom;

  const centerX = (cropWidth - currentWidth) / 2;
  const centerY = (cropHeight - currentHeight) / 2;

  // Bound the panning so image always covers the crop box
  const boundX = Math.max(0, (currentWidth - cropWidth) / 2);
  const boundY = Math.max(0, (currentHeight - cropHeight) / 2);

  const constrainedPanX = Math.max(-boundX, Math.min(boundX, pan.x));
  const constrainedPanY = Math.max(-boundY, Math.min(boundY, pan.y));

  // Position of image relative to crop box
  const posX = centerX + constrainedPanX;
  const posY = centerY + constrainedPanY;

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setShowGrid(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newPanX = e.clientX - dragStart.x;
    const newPanY = e.clientY - dragStart.y;
    setPan({ x: newPanX, y: newPanY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setShowGrid(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setShowGrid(true);
    setDragStart({
      x: e.touches[0].clientX - pan.x,
      y: e.touches[0].clientY - pan.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const newPanX = e.touches[0].clientX - dragStart.x;
    const newPanY = e.touches[0].clientY - dragStart.y;
    setPan({ x: newPanX, y: newPanY });
  };

  // Save/Export cropped image
  const handleCropSave = () => {
    if (!imgElement) return;

    // Relative values for cropping on natural image
    const scale = baseScale * zoom;
    
    // Position of top-left corner of crop box relative to top-left of image
    const relativeImageX = -posX;
    const relativeImageY = -posY;

    // Convert screen crop dimensions back to natural image dimensions
    let sourceX = relativeImageX / scale;
    let sourceY = relativeImageY / scale;
    let sourceWidth = cropWidth / scale;
    let sourceHeight = cropHeight / scale;

    const canvas = document.createElement("canvas");
    // Target higher resolution for clean display (retina scale)
    const exportWidth = cropWidth * 2;
    const exportHeight = cropHeight * 2;
    canvas.width = exportWidth;
    canvas.height = exportHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render configuration
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Create a temporary canvas if there's rotation to handle it beautifully
    if (rotation !== 0) {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      
      const origW = imgElement.naturalWidth;
      const origH = imgElement.naturalHeight;

      if (rotation === 90 || rotation === 270) {
        tempCanvas.width = origH;
        tempCanvas.height = origW;
      } else {
        tempCanvas.width = origW;
        tempCanvas.height = origH;
      }

      if (tempCtx) {
        tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
        tempCtx.rotate((rotation * Math.PI) / 180);
        tempCtx.drawImage(imgElement, -origW / 2, -origH / 2);

        // Now draw from our rotated temporary canvas
        ctx.drawImage(
          tempCanvas,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          exportWidth,
          exportHeight
        );
      }
    } else {
      ctx.drawImage(
        imgElement,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        exportWidth,
        exportHeight
      );
    }

    // Export to Base64
    const croppedUrl = canvas.toDataURL("image/jpeg", 0.92);
    onCrop(croppedUrl);
  };

  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
    setPan({ x: 0, y: 0 }); // reset panning upon rotation
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        id="image-cropper-modal-container"
        className="bg-[#0e0e0e] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto h-[90vh] max-h-[90vh]"
      >
        {/* Header */}
        <div className="border-b border-white/[0.05] p-4 flex items-center justify-between bg-black/40">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-mono opacity-50 block">Photo Tool</span>
            <span className="text-sm font-semibold tracking-tight uppercase text-[#D4AF37]">
              Crop Image Preview
            </span>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-h-0 bg-black/20 overflow-y-auto">
          {loading ? (
            <div className="h-72 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 text-[#D4AF37] animate-spin" />
              <p className="text-xs text-gray-500 font-mono">Loading high-res editor...</p>
            </div>
          ) : error ? (
            <div className="h-72 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <p className="text-red-400 text-xs font-sans bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                {error}
              </p>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/10"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Aspect Ratio Presets (Only visible when imageType is 'gallery') */}
              {imageType === "gallery" && (
                <div className="border-b border-white/[0.04] px-4 py-2 flex items-center gap-2 overflow-x-auto bg-black/30 scrollbar-none">
                  <span className="text-[9px] font-mono uppercase text-gray-400 mr-2 whitespace-nowrap">Aspect Ratio:</span>
                  {presets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setAspectRatio(preset);
                        setPan({ x: 0, y: 0 }); // reset pan on aspect change
                      }}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono border transition-all whitespace-nowrap ${
                        aspectRatio.id === preset.id
                          ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30 font-bold"
                          : "bg-transparent border-white/5 text-gray-500 hover:border-white/15 hover:text-gray-300"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Viewport Workspace */}
              <div
                ref={containerRef}
                className="relative flex-1 min-h-[300px] md:min-h-[380px] bg-[#050505] flex items-center justify-center overflow-hidden select-none touch-none"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Image Cropper Viewport wrapper */}
                <div
                  style={{
                    width: `${cropWidth}px`,
                    height: `${cropHeight}px`,
                  }}
                  className="relative overflow-hidden border border-[#D4AF37]/40 shadow-2xl cursor-move bg-[#111]"
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  {/* The Image inside crop boundary */}
                  <img
                    src={imageSrc}
                    alt="Source"
                    style={{
                      position: "absolute",
                      width: `${currentWidth}px`,
                      height: `${currentHeight}px`,
                      left: `${posX}px`,
                      top: `${posY}px`,
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: "center center",
                      maxWidth: "none",
                      pointerEvents: "none",
                    }}
                    className="transition-transform duration-150 ease-out"
                    referrerPolicy="no-referrer"
                  />

                  {/* Aesthetic grid overlay (Rule of Thirds) */}
                  <div
                    className={`absolute inset-0 border border-[#D4AF37]/50 pointer-events-none transition-opacity duration-300 ${
                      showGrid ? "opacity-100" : "opacity-30"
                    }`}
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-x-0 top-1/3 border-b border-dashed border-[#D4AF37]/30" />
                    <div className="absolute inset-x-0 top-2/3 border-b border-dashed border-[#D4AF37]/30" />
                    <div className="absolute inset-y-0 left-1/3 border-r border-dashed border-[#D4AF37]/30" />
                    <div className="absolute inset-y-0 left-2/3 border-r border-dashed border-[#D4AF37]/30" />

                    {/* Decorative crop corners */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]" />
                  </div>
                </div>

                {/* Subtle Instruction Badge */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/85 border border-white/10 px-3 py-1 rounded-full text-[9px] font-mono text-gray-400 flex items-center gap-1.5 backdrop-blur-sm shadow-md">
                  <Move className="w-3 h-3 text-[#D4AF37]" />
                  Drag photo to position • Use slider to zoom
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Controls footer (Sticky) */}
        {!loading && !error && (
          <div className="border-t border-white/[0.05] p-4 space-y-4 bg-[#0a0a0a] shrink-0 sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
              {/* Zoom controls */}
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={() => setZoom(prev => Math.max(1, prev - 0.1))}
                  className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="w-full md:w-36 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />
                <button
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                  className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-lg"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono text-gray-500 min-w-[28px]">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Actions (Rotation, Cancel, Save) */}
              <div className="flex items-center justify-end gap-2 w-full md:w-auto">
                { (imageType === "gallery" || imageType === "gallery-edit") && onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-3 py-1.5 bg-red-950/20 hover:bg-red-900/50 border border-red-500/20 rounded-lg text-xs text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
                { (imageType === "gallery" || imageType === "gallery-edit") && onReplace && (
                  <label
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Replace Image"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Replace
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          onReplace(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                )}
                <button
                  type="button"
                  onClick={rotateImage}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Rotate 90° Clockwise"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Rotate
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-1.5 bg-transparent hover:bg-gray-800 border border-gray-400 rounded-lg text-xs text-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropSave}
                  className="px-5 py-1.5 bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-bold uppercase tracking-wider text-[10px] rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-900/50 cursor-pointer"
                >
                  <Check className="w-4 h-4" strokeWidth={3} />
                  Apply & Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
