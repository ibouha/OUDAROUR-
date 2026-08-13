import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadDocumentPdf(selector: string, filename: string) {
  const documentElement = document.querySelector<HTMLElement>(selector);
  if (!documentElement) throw new Error("Document introuvable dans la page.");
  await document.fonts.ready;

  const canvas = await html2canvas(documentElement, {
    backgroundColor: "#ffffff",
    logging: false,
    scale: 3,
    useCORS: true,
    windowWidth: 1200,
    onclone: (clonedDocument) => {
      const clonedElement = clonedDocument.querySelector<HTMLElement>(selector);
      if (!clonedElement) return;
      clonedElement.style.width = "900px";
      clonedElement.style.maxWidth = "900px";
      clonedElement.style.margin = "0";
      clonedElement.style.boxShadow = "none";
      clonedElement.style.minHeight = `${Math.ceil(900 * 297 / 210)}px`;
      clonedElement.style.display = "flex";
      clonedElement.style.flexDirection = "column";
      const legalFooter = clonedElement.querySelector<HTMLElement>(".invoice-legal-footer");
      if (legalFooter) legalFooter.style.marginTop = "auto";
    },
  });

  const pdf = new jsPDF({ unit:"mm", format:"a4", orientation:"portrait", compress:true });
  const pageWidthMm = 210;
  const pageHeightMm = 297;
  const pageHeightPx = Math.ceil(canvas.width * pageHeightMm / pageWidthMm);
  let sourceY = 0;
  let pageIndex = 0;

  while (sourceY < canvas.height) {
    const remainingHeight = canvas.height - sourceY;
    if (pageIndex > 0 && remainingHeight <= 4) break;
    const sliceHeight = Math.min(pageHeightPx, remainingHeight);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    const context = pageCanvas.getContext("2d");
    if (!context) throw new Error("Canvas PDF indisponible.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
    if (pageIndex > 0) pdf.addPage();
    const sliceHeightMm = sliceHeight * pageWidthMm / canvas.width;
    pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pageWidthMm, sliceHeightMm, undefined, "FAST");
    sourceY += sliceHeight;
    pageIndex += 1;
  }

  pdf.save(filename);
}
