// // src/utils/pdfToPng.ts
// import * as pdfjsLib from "pdfjs-dist";

// // ✅ Vite-friendly worker setup
// import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// export type PdfToPngOptions = {
//   scale?: number; // image quality
//   pages?: "first" | "all"; // cover usually "first"
// };

// /**
//  * Convert a PDF File into PNG image(s) as Data URLs.
//  * Returns array of PNG data URLs (one per page).
//  */
// export async function pdfFileToPngDataUrls(
//   file: File,
//   options: PdfToPngOptions = { scale: 2, pages: "first" }
// ): Promise<string[]> {
//   const { scale = 2, pages = "first" } = options;

//   const arrayBuffer = await file.arrayBuffer();
//   const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
//   const pdf = await loadingTask.promise;

//   const totalPages = pdf.numPages;
//   const pageNumbers =
//     pages === "all" ? Array.from({ length: totalPages }, (_, i) => i + 1) : [1];

//   const results: string[] = [];

//   for (const pageNo of pageNumbers) {
//     const page = await pdf.getPage(pageNo);
//     const viewport: any = page.getViewport({ scale });

//     const canvas = document.createElement("canvas");
//     const ctx: any = canvas.getContext("2d");
//     if (!ctx) throw new Error("Canvas context not available");

//     canvas.width = Math.floor(viewport.width);
//     canvas.height = Math.floor(viewport.height);

//     // await page.render({ canvasContext: ctx, viewport }).promise;

//     const dataUrl = canvas.toDataURL("image/png");
//     results.push(dataUrl);
//   }

//   return results;
// }
