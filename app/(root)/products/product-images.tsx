"use client";

import { cn } from "@/lib/utils";
import { MediaType } from "@/types/product";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "@/components/ui/optimized-image";
import React, { useEffect, useRef, useState } from "react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const ProductImages = ({
  media,
  featureImage,
}: {
  media: MediaType[];
  featureImage: string;
}) => {
  const galleryImages = Array.from(
    new Set([featureImage, ...media.map((item) => item.mediaUrl)].filter(Boolean))
  );

  const [current, setCurrent] = useState(0);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerScale, setViewerScale] = useState(1);
  const [viewerOffset, setViewerOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageRatio, setImageRatio] = useState(1);

  const zoomAnimationRef = useRef<number | null>(null);
  const zoomCurrentRef = useRef({ x: 50, y: 50 });
  const zoomTargetRef = useRef({ x: 50, y: 50 });
  const zoomSurfaceRef = useRef<HTMLDivElement>(null);
  const viewerStageRef = useRef<HTMLDivElement>(null);
  const activeImage = galleryImages[current] || featureImage;

  const getContainedImageSize = () => {
    const stage = viewerStageRef.current;
    if (!stage) return { width: 0, height: 0 };

    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;
    const stageRatio = stageWidth / stageHeight;

    if (imageRatio > stageRatio) {
      return {
        width: stageWidth,
        height: stageWidth / imageRatio,
      };
    }

    return {
      width: stageHeight * imageRatio,
      height: stageHeight,
    };
  };

  const clampViewerOffset = (offset: { x: number; y: number }, scale: number) => {
    if (scale <= 1) return { x: 0, y: 0 };

    const { width, height } = getContainedImageSize();
    const maxX = Math.max(0, (width * (scale - 1)) / 2);
    const maxY = Math.max(0, (height * (scale - 1)) / 2);

    return {
      x: clamp(offset.x, -maxX, maxX),
      y: clamp(offset.y, -maxY, maxY),
    };
  };

  const resetViewerTransform = () => {
    setViewerScale(1);
    setViewerOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const updateViewerScale = (nextScale: number) => {
    const safeScale = clamp(nextScale, 1, 5);
    setViewerScale(safeScale);
    setViewerOffset((prev) => clampViewerOffset(prev, safeScale));
  };

  const openViewer = () => {
    resetViewerTransform();
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    resetViewerTransform();
  };

  const handleZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    zoomTargetRef.current = {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
    };
  };

  const startZoomAnimation = () => {
    if (zoomAnimationRef.current !== null) return;

    const animate = () => {
      const surface = zoomSurfaceRef.current;
      const current = zoomCurrentRef.current;
      const target = zoomTargetRef.current;
      const ease = 0.22;

      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;

      if (surface) {
        surface.style.setProperty("--zoom-x", `${current.x}%`);
        surface.style.setProperty("--zoom-y", `${current.y}%`);
      }

      const isSettled =
        Math.abs(target.x - current.x) < 0.02 &&
        Math.abs(target.y - current.y) < 0.02;

      if (!isZoomActive && isSettled) {
        zoomAnimationRef.current = null;
        return;
      }

      zoomAnimationRef.current = window.requestAnimationFrame(animate);
    };

    zoomAnimationRef.current = window.requestAnimationFrame(animate);
  };

  const handleViewerMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (viewerScale <= 1) return;

    setIsDragging(true);
    setDragStart({
      x: event.clientX - viewerOffset.x,
      y: event.clientY - viewerOffset.y,
    });
  };

  const handleViewerMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const nextOffset = clampViewerOffset(
      {
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y,
      },
      viewerScale
    );

    setViewerOffset(nextOffset);
  };

  const handleViewerTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (viewerScale <= 1) return;

    const touch = event.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - viewerOffset.x,
      y: touch.clientY - viewerOffset.y,
    });
  };

  const handleViewerTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const touch = event.touches[0];
    const nextOffset = clampViewerOffset(
      {
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      },
      viewerScale
    );

    setViewerOffset(nextOffset);
  };

  useEffect(() => {
    if (!isViewerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "+") updateViewerScale(viewerScale + 0.4);
      if (event.key === "-") updateViewerScale(viewerScale - 0.4);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isViewerOpen, viewerScale]);

  useEffect(() => {
    setCurrent(0);
    setIsZoomActive(false);
    zoomCurrentRef.current = { x: 50, y: 50 };
    zoomTargetRef.current = { x: 50, y: 50 };
  }, [featureImage]);

  useEffect(() => {
    if (isZoomActive) {
      startZoomAnimation();
    }

    return () => {
      if (zoomAnimationRef.current !== null) {
        window.cancelAnimationFrame(zoomAnimationRef.current);
        zoomAnimationRef.current = null;
      }
    };
  }, [isZoomActive]);

  useEffect(() => {
    if (!isViewerOpen) return;
    setViewerOffset((prev) => clampViewerOffset(prev, viewerScale));
  }, [isViewerOpen, viewerScale, imageRatio]);

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        <div className="order-1 min-w-0">
          <div
            ref={zoomSurfaceRef}
            className="group relative flex min-h-[22rem] cursor-zoom-in items-center justify-center overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-linear-to-br from-white via-zinc-50 to-zinc-100 p-4 xl:cursor-none lg:min-h-[38rem]"
            onMouseEnter={() => {
              setIsZoomActive(true);
              startZoomAnimation();
            }}
            onMouseLeave={() => {
              setIsZoomActive(false);
            }}
            onMouseMove={handleZoomMove}
            onClick={openViewer}
            style={
              {
                "--zoom-x": "50%",
                "--zoom-y": "50%",
              } as React.CSSProperties
            }
          >
            <Image
              src={activeImage}
              alt="Product image"
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              quality={100}
              priority
              loading="eager"
              unoptimized
              placeholder="empty"
              className={cn(
                "object-contain object-center transition-transform duration-300 ease-out",
                isZoomActive ? "scale-[2.9]" : "scale-100"
              )}
              style={{
                transformOrigin: "var(--zoom-x) var(--zoom-y)",
                willChange: "transform",
              }}
            />

            <div
              className={cn(
                "pointer-events-none absolute left-0 top-0 hidden h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[opacity,transform] duration-150 xl:block",
                isZoomActive ? "scale-100 opacity-100" : "scale-90 opacity-0"
              )}
              style={{
                left: "var(--zoom-x)",
                top: "var(--zoom-y)",
                willChange: "left, top, transform, opacity",
              }}
            >
              <div className="absolute inset-0 rounded-full border border-black/35 bg-linear-to-br from-white/32 via-white/12 to-black/8 shadow-[0_18px_45px_rgba(15,23,42,0.24),0_0_0_1px_rgba(255,255,255,0.38)] backdrop-blur-[3px]" />
              <div className="absolute inset-[3px] rounded-full border border-white/70" />
              <div className="absolute inset-[5px] rounded-full border border-black/18" />
              <div className="absolute inset-[11px] rounded-full border border-white/28" />
              <div className="absolute left-1/2 top-[22%] h-4 w-8 -translate-x-1/2 rounded-full bg-white/28 blur-sm" />
              <div className="absolute left-1/2 top-1/2 h-8 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 shadow-[0_0_0_1px_rgba(255,255,255,0.9),0_0_10px_rgba(255,255,255,0.35)]" />
              <div className="absolute left-1/2 top-1/2 h-[2px] w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 shadow-[0_0_0_1px_rgba(255,255,255,0.9),0_0_10px_rgba(255,255,255,0.35)]" />
              <div className="absolute left-1/2 top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 shadow-[0_0_0_1px_rgba(0,0,0,0.28)]" />
            </div>

            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full border border-white/80 bg-white/92 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-700 shadow-lg backdrop-blur">
              <span>Hover to zoom</span>
              <span>Click for full HD view</span>
            </div>
          </div>
        </div>

        <div className="order-2 flex gap-2 overflow-x-auto pb-1">
          {galleryImages.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              onClick={() => setCurrent(index)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-white p-1 transition-all duration-200 lg:h-24 lg:w-24",
                current === index
                  ? "border-primarymain shadow-[0_12px_35px_rgba(220,38,38,0.16)]"
                  : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              <Image
                src={imageUrl}
                alt={`Product thumbnail ${index + 1}`}
                fill
                sizes="96px"
                unoptimized
                placeholder="empty"
                className="rounded-xl object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {isViewerOpen && (
        <div className="fixed inset-0 z-[120] bg-black/92 backdrop-blur-sm">
          <button
            type="button"
            onClick={closeViewer}
            className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close image viewer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 text-white shadow-xl backdrop-blur">
            <button
              type="button"
              onClick={() => updateViewerScale(viewerScale - 0.4)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="min-w-16 text-center text-sm font-medium">
              {Math.round(viewerScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => updateViewerScale(viewerScale + 0.4)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-4 z-20 mx-auto flex w-max max-w-[calc(100vw-2rem)] gap-2 overflow-x-auto rounded-full border border-white/15 bg-black/35 px-3 py-3 backdrop-blur">
            {galleryImages.map((imageUrl, index) => (
              <button
                key={`viewer-${imageUrl}-${index}`}
                type="button"
                onClick={() => {
                  setCurrent(index);
                  resetViewerTransform();
                }}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border transition",
                  current === index ? "border-white" : "border-white/20"
                )}
              >
                <Image
                  src={imageUrl}
                  alt={`Preview ${index + 1}`}
                  fill
                  sizes="64px"
                  unoptimized
                  placeholder="empty"
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          <div
            ref={viewerStageRef}
            className={cn(
              "absolute inset-[5.5rem_1rem_6.5rem_1rem] overflow-hidden rounded-[2rem] md:inset-[6rem_3rem_7rem_3rem]",
              viewerScale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
            )}
            onClick={() => {
              if (viewerScale === 1) {
                updateViewerScale(2);
              }
            }}
            onWheel={(event) => {
              event.preventDefault();
              updateViewerScale(viewerScale + (event.deltaY < 0 ? 0.25 : -0.25));
            }}
            onMouseDown={handleViewerMouseDown}
            onMouseMove={handleViewerMouseMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={handleViewerTouchStart}
            onTouchMove={handleViewerTouchMove}
            onTouchEnd={() => setIsDragging(false)}
          >
            <Image
              src={activeImage}
              alt="Full resolution product view"
              fill
              sizes="100vw"
              quality={100}
              unoptimized
              placeholder="empty"
              className="select-none object-contain"
              draggable={false}
              onLoad={(event) => {
                const target = event.currentTarget;
                if (target.naturalWidth && target.naturalHeight) {
                  setImageRatio(target.naturalWidth / target.naturalHeight);
                }
              }}
              style={{
                transform: `translate(${viewerOffset.x}px, ${viewerOffset.y}px) scale(${viewerScale})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 120ms ease-out",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductImages;
