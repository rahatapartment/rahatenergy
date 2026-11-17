import sharp from "sharp";
import { createHash } from "node:crypto";
import { CommerceError } from "./commerce-validation";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export async function prepareProductImage(bytes: Buffer) {
  if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES) throw new CommerceError("Choose an image smaller than 10 MB.", 413);
  try {
    const decoder = sharp(bytes, { limitInputPixels: 24_000_000, animated: false, failOn: "warning" });
    const metadata = await decoder.metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format || '') || (metadata.pages ?? 1) > 1)
      throw new CommerceError("Choose a non-animated JPG, PNG or WebP image.");
    const output = await decoder.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toBuffer({ resolveWithObject: true });
    if (output.data.length > 2_000_000) throw new CommerceError("This image is too complex. Try a smaller version.", 413);
    const [thumbnail, medium] = await Promise.all([160, 640].map(width => sharp(output.data).resize({ width, height: width, fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toBuffer()));
    return { id: createHash("sha256").update(output.data).digest("hex"), data: output.data, thumbnail, medium,
      width: output.info.width, height: output.info.height };
  } catch (e) {
    if (e instanceof CommerceError) throw e;
    throw new CommerceError("Unable to read this image. Choose a valid JPG, PNG or WebP.");
  }
}
