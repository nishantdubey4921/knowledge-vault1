import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentials) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not set");
  const parsed = JSON.parse(credentials);
  return new google.auth.GoogleAuth({
    credentials: parsed,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");
    if (!fileId) return NextResponse.json({ error: "No file id" }, { status: 400 });

    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });

    // Get metadata first
    const meta = await drive.files.get({
      fileId,
      fields: "id,name,mimeType,size,webViewLink",
    });

    const mimeType = meta.data.mimeType || "";

    // For Google Docs/Sheets/Slides → export as PDF
    let exportMime = "";
    if (mimeType === "application/vnd.google-apps.document") exportMime = "application/pdf";
    else if (mimeType === "application/vnd.google-apps.spreadsheet") exportMime = "application/pdf";
    else if (mimeType === "application/vnd.google-apps.presentation") exportMime = "application/pdf";

    if (exportMime) {
      const exported = await drive.files.export(
        { fileId, mimeType: exportMime },
        { responseType: "stream" }
      );
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        (exported.data as NodeJS.ReadableStream).on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        (exported.data as NodeJS.ReadableStream).on("end", resolve);
        (exported.data as NodeJS.ReadableStream).on("error", reject);
      });
      const buffer = Buffer.concat(chunks);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${meta.data.name}.pdf"`,
          "Cache-Control": "private, max-age=300",
        },
      });
    }

    // Direct download for PDFs and other files
    const downloaded = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      (downloaded.data as NodeJS.ReadableStream).on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      (downloaded.data as NodeJS.ReadableStream).on("end", resolve);
      (downloaded.data as NodeJS.ReadableStream).on("error", reject);
    });
    const buffer = Buffer.concat(chunks);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${meta.data.name}"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
