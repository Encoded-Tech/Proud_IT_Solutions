"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaPlacement, MediaType } from "@/types/media";
import { addMedia, updateMedia } from "@/lib/server/actions/admin/media/mediaActions";
import toast from "react-hot-toast";
import { 
  Upload, 
  X, 
  ImageIcon, 
  Video, 
  MapPin, 
  Loader2, 
  Check,
  FileImage
} from "lucide-react";
import { useRouter } from "next/navigation";

const placements: MediaPlacement[] = [
  "hero_first",
  "hero_second",
  "hero_third",
  "hero_fourth",
  "build-user-pc",
  "best_seller_video_1",
  "best_seller_video_2",
  "hot_deals_video",
];

const types: MediaType[] = ["image", "video"];

interface MediaItem {
  _id: string;
  url: string;
  type: MediaType;
  placement: MediaPlacement;
  createdAt?: string;
}

interface MediaFormProps {
  media?: MediaItem; // If provided, we're in EDIT mode
  isModal?: boolean; // If true, form is rendered in a modal
  onCancel?: () => void; // Callback for modal cancel
}

export default function MediaForm({ media, isModal = false, onCancel }: MediaFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(media?.url || null);
  const [type, setType] = useState<MediaType>(media?.type || "image");
  const [placement, setPlacement] = useState<MediaPlacement>(media?.placement || "hero_first");
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (media) {
      setType(media.type);
      setPlacement(media.placement);
      setFilePreview(media.url);
    }
  }, [media]);

  const handleFileSelect = (selectedFile: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 50MB');
      return;
    }

    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');

    if (type === 'image' && !isImage) {
      toast.error('Please select an image file');
      return;
    }

    if (type === 'video' && !isVideo) {
      toast.error('Please select a video file');
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFileSelect(selectedFile);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(media?.url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In edit mode, file is optional (only if changing the media)
    if (!media && !file) {
      toast.error("Please select a file");
      return;
    }

    setButtonState('loading');
    try {
      let res;
      
      if (media) {
        // Edit mode
        if (file) {
          res = await updateMedia({
       
            file: file,
            placement,
          });
        } else {
          // Update only placement without file
          res = await updateMedia({
  
            placement,
          });
        }
      } else {
        // Add mode - file is required
        if (!file) {
          toast.error("Please select a file");
          setButtonState('idle');
          return;
        }
        res = await addMedia({ file, placement });
      }

      if (res.success) {
        toast.success(res.message);
        setButtonState('success');
        
        setTimeout(() => {
          if (isModal) {
            onCancel?.();
            router.refresh();
          } else {
            router.push("/admin/posts");
            setFile(null);
            setFilePreview(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }
          setButtonState('idle');
        }, 800);
      } else {
        toast.error(res.message);
        setButtonState('idle');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(errorMessage);
      setButtonState('idle');
    }
  };

  const formatPlacementLabel = (placement: string) => {
    return placement.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const FormContent = (
    <div className={`${!isModal ? 'min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4' : ''}`}>
      <div className={`${!isModal ? 'max-w-5xl mx-auto' : ''}`}>
        <form onSubmit={handleSubmit} className={`bg-white ${!isModal ? 'rounded-3xl shadow-2xl border border-gray-200' : 'rounded-2xl'} overflow-hidden`}>
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-8 py-10">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <FileImage className="w-8 h-8 text-white" />
                  <h1 className="text-4xl font-bold text-white">
                    {media ? 'Edit Media' : 'Upload Media'}
                  </h1>
                </div>
                {isModal && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
              <p className="text-red-100 text-lg">
                {media ? 'Update media placement and file' : 'Add images or videos to your website placements'}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          </div>

          <div className="p-10 space-y-10">
            
            {/* Media Configuration */}
            <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-300">
                <ImageIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-800">Media Configuration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Media Type */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Media Type *
                  </label>
                  <Select 
                    value={type} 
                    onValueChange={(val) => {
                      if (!media) { // Only allow type change in add mode
                        setType(val as MediaType);
                        setFile(null);
                        setFilePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }
                    }}
                    disabled={!!media} // Disable in edit mode
                  >
                    <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl">
                      <SelectValue placeholder="Select media type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t} value={t}>
                          <div className="flex items-center gap-2">
                            {t === 'image' ? (
                              <ImageIcon className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Video className="w-4 h-4 text-purple-600" />
                            )}
                            <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {media && (
                    <p className="text-xs text-gray-500 mt-1">Media type cannot be changed</p>
                  )}
                </div>

                {/* Placement */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Placement *
                  </label>
                  <Select value={placement} onValueChange={(val) => setPlacement(val as MediaPlacement)}>
                    <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl">
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      {placements.map((p) => (
                        <SelectItem key={p} value={p}>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span>{formatPlacementLabel(p)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-6 bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-2xl border border-violet-200">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-violet-300">
                <Upload className="w-6 h-6 text-violet-600" />
                <h3 className="text-2xl font-bold text-gray-800">
                  {media ? 'Change File (Optional)' : 'Upload File'}
                </h3>
              </div>

              <div
                className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group ${
                  isDragging 
                    ? 'border-violet-600 bg-violet-200 scale-105' 
                    : 'border-violet-300 hover:border-violet-500 hover:bg-violet-100'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {type === 'image' ? (
                  <ImageIcon className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                    isDragging ? 'text-violet-600 animate-bounce' : 'text-violet-400 group-hover:text-violet-600'
                  }`} />
                ) : (
                  <Video className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                    isDragging ? 'text-violet-600 animate-bounce' : 'text-violet-400 group-hover:text-violet-600'
                  }`} />
                )}
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  {isDragging ? 'Drop file here!' : media ? 'Click to change file or drag & drop' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-sm text-gray-500">
                  {type === 'image' ? 'PNG, JPG, WEBP, GIF' : 'MP4, WEBM, MOV'} up to 5MB
                </p>
                {media && (
                  <p className="text-xs text-gray-600 mt-2">Leave unchanged to keep current file</p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={type === "image" ? "image/*" : "video/*"}
                  onChange={handleFileChange}
                />
              </div>

              {/* File Preview */}
              {filePreview && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <div className="relative aspect-square group">
                    {type === 'image' ? (
                      <Image
                        src={filePreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-xl border-2 border-violet-200 group-hover:border-violet-500 transition-all"
                      />
                    ) : (
                      <div className="relative w-full h-full rounded-xl border-2 border-violet-200 group-hover:border-violet-500 bg-gray-900 flex items-center justify-center overflow-hidden">
                        <video 
                          src={filePreview} 
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <Video className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    )}
                    {file && (
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* File Info */}
              {file && (
                <div className="bg-white p-4 rounded-xl border-2 border-violet-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Selected File</p>
                      <p className="text-sm text-gray-600 mt-1">{file.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">Size</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                onClick={() => {
                  if (isModal) {
                    onCancel?.();
                  } else {
                    router.push("/admin/posts");
                  }
                }}
                className="flex-1 h-14 text-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all"
                disabled={buttonState === 'loading'}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={buttonState === 'loading' || (!media && !file)}
                className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {buttonState === 'idle' && (
                  <span className="flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    {media ? 'Update Media' : 'Upload Media'}
                  </span>
                )}
                {buttonState === 'loading' && (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {media ? 'Updating...' : 'Uploading...'}
                  </span>
                )}
                {buttonState === 'success' && (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    {media ? 'Updated!' : 'Uploaded!'}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  // If it's a modal, wrap in a modal container
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          {FormContent}
        </div>
      </div>
    );
  }

  return FormContent;
}