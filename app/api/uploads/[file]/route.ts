import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;

  // Sanitize: only allow filename, no path traversal
  const safe = path.basename(file);
  if (!safe || safe !== file) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "uploads", safe);

  try {
    const buf = await readFile(filePath);
    const ext = path.extname(safe).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".webp"
        ? "image/webp"
        : "application/octet-stream";

    return new NextResponse(buf, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
