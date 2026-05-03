import NextImage, { type ImageProps } from "next/image";

const shimmer = (width: number, height: number) => `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#E5E7EB"/>
    <rect id="pulse" width="${width}" height="${height}" fill="url(#paint0_linear_1_2)"/>
    <defs>
      <linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="${width}" y2="0" gradientUnits="userSpaceOnUse">
        <stop stop-color="#E5E7EB"/>
        <stop offset="0.5" stop-color="#F8FAFC"/>
        <stop offset="1" stop-color="#E5E7EB"/>
      </linearGradient>
    </defs>
  </svg>
`;

const toBase64 = (value: string) =>
  typeof window === "undefined"
    ? Buffer.from(value).toString("base64")
    : window.btoa(value);

const defaultBlurDataURL = `data:image/svg+xml;base64,${toBase64(shimmer(24, 24))}`;

const isNonOptimizableSource = (src: ImageProps["src"]) =>
  typeof src === "string" &&
  (src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.endsWith(".svg") ||
    src.includes(".svg?"));

export default function Image({
  alt,
  priority,
  placeholder,
  blurDataURL,
  loading,
  quality,
  ...props
}: ImageProps) {
  const canUseBlur = !isNonOptimizableSource(props.src);

  return (
    <NextImage
      alt={alt}
      priority={priority}
      loading={loading ?? (priority ? undefined : "lazy")}
      quality={quality ?? 85}
      placeholder={placeholder ?? (canUseBlur ? "blur" : "empty")}
      blurDataURL={blurDataURL ?? (canUseBlur ? defaultBlurDataURL : undefined)}
      {...props}
    />
  );
}
