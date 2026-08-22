"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type MediaImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

/**
 * next/image cannot load blob: or data: URLs. Demo uploads live as object URLs
 * in the browser, so those fall back to a plain img.
 */
export function MediaImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  ...rest
}: MediaImageProps) {
  const isLocal = src.startsWith("blob:") || src.startsWith("data:");

  if (isLocal) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn(fill && "absolute inset-0 size-full", className)}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      width={width}
      height={height}
      {...rest}
    />
  );
}
