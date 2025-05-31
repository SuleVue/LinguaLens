import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

export function downloadTxt(text: string, filename: string = "extracted_text.txt") {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  saveAs(blob, filename);
}

export async function downloadDocx(text: string, filename: string = "extracted_text.docx") {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: text.split('\n').map(line => new Paragraph({
          children: [new TextRun(line)],
        })),
      },
    ],
  });

  try {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  } catch (error) {
    console.error("Error generating DOCX:", error);
    throw new Error("Failed to generate DOCX file.");
  }
}
