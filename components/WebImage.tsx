"use client";

import Image, { type ImageProps } from "next/image";
import manifest from "@/lib/image-manifest.json";

type ImageEntry = {
  width: number;
  height: number;
  blurDataURL: string;
  variants: { src: string; width: number; bytes: number }[];
};
const images: Record<string, ImageEntry> = manifest;

/** Serve precompressed responsive assets without runtime image conversion. */
export default function WebImage(props: ImageProps) {
  if (typeof props.src === "string" && /^\/api\/product-images\/[a-f0-9]{64}$/.test(props.src) && !props.loader && !props.unoptimized) {
    return <Image {...props} alt={props.alt} loader={({ src, width }) => `${src}?w=${width <= 160 ? 160 : width <= 640 ? 640 : 1600}`} />;
  }
  const entry = typeof props.src === "string"
    ? images[decodeURI(props.src)]
    : undefined;
  if (!entry || props.loader || props.unoptimized) return <Image {...props} alt={props.alt} />;

  return (
    <Image
      {...props}
      alt={props.alt}
      loader={({ width }) => encodeURI(
        (entry.variants.find(variant => variant.width >= width)
          ?? entry.variants[entry.variants.length - 1]).src,
      )}
      placeholder={props.placeholder ?? "blur"}
      blurDataURL={props.blurDataURL ?? entry.blurDataURL}
    />
  );
}
