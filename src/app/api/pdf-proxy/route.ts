import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "URL diperlukan" }, { status: 400 });
  }

  try {
    let fileId = "";
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    const exportMatch = url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
    if (driveMatch) fileId = driveMatch[1];
    else if (exportMatch) fileId = exportMatch[1];
    else {
      const directResponse = await fetch(url);
      return new Response(directResponse.body, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const response = await fetch(downloadUrl);

    if (response.headers.get("content-type")?.includes("text/html")) {
      const html = await response.text();
      const confirmMatch = html.match(/confirm=([^&\s"']+)/);
      if (confirmMatch) {
        const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${fileId}`;
        const confirmResponse = await fetch(confirmUrl);
        return new Response(confirmResponse.body, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengunduh PDF" }, { status: 500 });
  }
}
