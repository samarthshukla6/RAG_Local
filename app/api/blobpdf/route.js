import { NextResponse } from "next/server";
import { ensurePdfWorker, PDFParse } from "../../../lib/pdfParse";

export async function POST(request) {
  try {
    ensurePdfWorker();

    const formData = await request.formData();
    const pdfBlob = formData.get("file");

    if (!pdfBlob || pdfBlob.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file format. Please upload a PDF file." },
        { status: 400 }
      );
    }

    const arrayBuffer = await pdfBlob.arrayBuffer();
    const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
    const { text } = await parser.getText();
    await parser.destroy();

    return NextResponse.json({ content: text.trim() }, { status: 200 });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json({ error: "Failed to process the PDF file." }, { status: 500 });
  }
}
