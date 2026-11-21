export const BURN_LOG_KEY = "burnwise-burn-done";

/** A burn the user marked as finished. Stored only in this browser. */
export type BurnRecord = {
  id: string;
  zoneId: string;
  zoneName: string;
  rai: number;
  material: string;
  markedAt?: string; // when the user said they would burn here
  doneAt: string; // ISO, when the user says the burn finished
  note: string;
  photo?: string; // small JPEG data URL, stays in this browser
  verdictAtDone: string; // what the sample criteria said when it was recorded
  sample: boolean; // zone data was sample data
};

export type BurnLog = { records: BurnRecord[] };
export const EMPTY_LOG: BurnLog = { records: [] };

/** Shrinks a photo so a few dozen fit in localStorage (about 80 KB each). */
export async function resizeImage(file: File, maxSide = 800, quality = 0.7): Promise<string> {
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(file, { imageOrientation: "from-image" }); } catch { bmp = await createImageBitmap(file); }
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return canvas.toDataURL("image/jpeg", quality);
}
