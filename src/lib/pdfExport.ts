import type { Resume } from '@/types';
import { downloadBlob } from '@/lib/utils';
import { createRoot } from 'react-dom/client';
import React, { useEffect } from 'react';
import ResumeDocument from '@/components/templates/ResumeDocument';

/**
 * A4 PDF export.
 *
 * Renders the same ResumeDocument used by the browser preview,
 * at the exact A4 CSS width, then maps it to an A4 PDF.
 */
export async function exportResumeToPdf(resume: Resume): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const A4_WIDTH_PX = 794;
  const A4_WIDTH_PT = 595.28;
  const A4_HEIGHT_PT = 841.89;

  /*
   * Create an isolated rendering area.
   */
  const host = document.createElement('div');

  Object.assign(host.style, {
    position: 'absolute', // Changed from fixed to absolute
    left: '0',            // Reset to 0 instead of -100000px to prevent rendering distortion
    top: '0',
    width: `${A4_WIDTH_PX}px`,
    minWidth: `${A4_WIDTH_PX}px`,
    margin: '0',
    padding: '0',
    background: '#ffffff',
    zIndex: '-9999',      // This hides it behind your app UI
    overflow: 'visible',
    boxSizing: 'border-box',
  });

  document.body.appendChild(host);

  const root = createRoot(host);

  await new Promise<void>((resolve) => {
    const Probe = () => {
      useEffect(() => {
        resolve();
      }, []);

      return React.createElement(ResumeDocument, {
        resume,
        scale: 1,
      });
    };

    root.render(React.createElement(Probe));
  });

  /*
   * Give fonts/images/layout time to finish.
   */
  await document.fonts?.ready;

  // Added a slight delay to ensure the browser has completely finished laying out the CSS
  await new Promise<void>((resolve) => setTimeout(resolve, 150));

  const target = host.firstElementChild as HTMLElement;

  if (!target) {
    root.unmount();
    host.remove();
    throw new Error('Unable to render resume for PDF export.');
  }

  /*
   * Make sure the rendered document starts exactly at 0,0.
   */
  target.style.margin = '0';
  target.style.width = `${A4_WIDTH_PX}px`; // Force exact width on the target child
  target.style.transform = 'none';
  target.style.transformOrigin = 'top left';

  /*
   * Render at high resolution for sharper PDF text.
   */
  const canvas = await html2canvas(target, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: A4_WIDTH_PX,
    width: A4_WIDTH_PX,
    scrollX: 0,
    scrollY: 0,
    // Removed x: 0 and y: 0 to let html2canvas naturally find the target's boundaries
  });

  root.unmount();
  host.remove();

  /*
   * Create A4 PDF.
   */
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = A4_WIDTH_PT;
  const pdfHeight = A4_HEIGHT_PT;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const pxPerPt = canvasWidth / pdfWidth;
  const pageHeightPx = Math.floor(pdfHeight * pxPerPt);

  let offsetY = 0;
  let pageIndex = 0;

  while (offsetY < canvasHeight) {
    const sliceHeight = Math.min(pageHeightPx, canvasHeight - offsetY);
    const pageCanvas = document.createElement('canvas');

    pageCanvas.width = canvasWidth;
    pageCanvas.height = sliceHeight;

    const ctx = pageCanvas.getContext('2d');

    if (!ctx) {
      throw new Error('Unable to create PDF canvas.');
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    ctx.drawImage(
      canvas,
      0,
      offsetY,
      canvasWidth,
      sliceHeight,
      0,
      0,
      canvasWidth,
      sliceHeight
    );

    if (pageIndex > 0) {
      pdf.addPage();
    }

    const imageData = pageCanvas.toDataURL('image/png');
    const imageHeightPt = sliceHeight / pxPerPt;

    pdf.addImage(
      imageData,
      'PNG',
      0,
      0,
      pdfWidth,
      imageHeightPt,
      undefined,
      'FAST'
    );

    offsetY += sliceHeight;
    pageIndex++;
  }

  /*
   * Download.
   */
  const filename = `${(resume.title || 'resume').replace(/[^a-z0-9-_ ]/gi, '_').trim()}.pdf`;

  downloadBlob(pdf.output('blob'), filename);
}