import fs from "fs";
import path from "path";
import { Buffer } from "buffer";
import { extractPdfText } from "../../../lib/extractPdfText";

export async function POST(req) {
  try {
    const { pdf } = await req.json();

    if (!pdf) {
      return Response.json({ error: "PDF data is required." }, { status: 400 });
    }

    const publicPath = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }

    const filename = `file_${Date.now()}.pdf`;
    const filePath = path.join(publicPath, filename);
    fs.writeFileSync(filePath, Buffer.from(pdf, "base64"));

    const text = await extractPdfText(filePath);

    return Response.json({ text });
  } catch (error) {
    console.error("PDF extraction error:", error);
    return Response.json({ error: error.message || "Failed to extract PDF text." }, { status: 500 });
  }
}
