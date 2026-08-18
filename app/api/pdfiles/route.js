import { extractPdfText } from "../../../lib/extractPdfText.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return Response.json({ error: "File name is required" }, { status: 400 });
    }

    const { text, usedOcr, charCount } = await extractPdfText(`public/${fileName}`);
    return Response.json({ text, usedOcr, charCount });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
