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
    const query = searchParams.get("q") || "";
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });

    let qStr = "trashed=false and mimeType!='application/vnd.google-apps.folder'";
    if (folderId) qStr += ` and '${folderId}' in parents`;
    if (query) qStr += ` and name contains '${query.replace(/'/g, "\\'")}'`;

    const res = await drive.files.list({
      q: qStr,
      fields: "files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink)",
      orderBy: "modifiedTime desc",
      pageSize: 100,
    });

    return NextResponse.json({ files: res.data.files || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
