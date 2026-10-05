import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure pdfjs worker using unpkg or dynamic import
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  // Use unpkg worker fallback matching the installed version for reliable browser execution
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
}

/**
 * Clean and normalize text extracted from documents
 */
export function sanitizeDocumentText(text: string): string {
  if (!text) return '';
  
  return text
    // Replace non-breaking spaces and strange unicode spaces
    .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    // Replace carriage returns
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove unprintable control characters (except tabs and newlines)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Fix hyphenated line breaks (e.g. "agree-\nment" -> "agreement")
    .replace(/(\w+)-\n(\w+)/g, '$1$2')
    // Compress multiple blank lines to at most two
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Check if a raw string looks like raw unparsed binary PDF/DOCX data
 */
export function isBinaryGibberish(text: string): boolean {
  if (!text) return false;
  if (text.startsWith('%PDF-')) return true;
  if (text.includes('stream\n') || text.includes('endstream')) return true;
  if (text.includes('PK\x03\x04')) return true; // Zip / DOCX header
  
  // Count non-printable or abnormal ASCII characters
  let nonPrintable = 0;
  const sample = text.slice(0, 1000);
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if ((code < 32 && code !== 9 && code !== 10 && code !== 13) || code > 126) {
      nonPrintable++;
    }
  }
  return nonPrintable / sample.length > 0.15;
}

/**
 * Extract clean text from a PDF ArrayBuffer using pdfjs-dist
 */
export async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<{ text: string; pageCount: number; pages: string[] }> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const pages: string[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let lastY: number | null = null;
      let pageText = '';

      for (const item of textContent.items as any[]) {
        if ('str' in item) {
          const str = item.str;
          // If Y coordinate changes significantly, treat as new line
          const currentY = item.transform ? item.transform[5] : null;
          if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
            pageText += '\n';
          } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n') && str.length > 0 && !str.startsWith(' ')) {
            pageText += ' ';
          }
          pageText += str;
          lastY = currentY;
        }
      }

      pages.push(sanitizeDocumentText(pageText));
    }

    const fullText = pages.join('\n\n');
    return { text: fullText, pageCount, pages };
  } catch (err) {
    console.error('PDF extraction failed:', err);
    throw new Error('Failed to parse PDF document. Please ensure the file is not corrupted or password-protected.');
  }
}

/**
 * Extract clean text from a Word document (.docx) ArrayBuffer using mammoth
 */
export async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return sanitizeDocumentText(result.value);
  } catch (err) {
    console.error('DOCX extraction failed:', err);
    throw new Error('Failed to parse Word document. Please ensure the file is a valid .docx document.');
  }
}

/**
 * Main entry point: Extract clean, human-readable text from any uploaded File
 */
export async function extractTextFromFile(file: File): Promise<{ text: string; filename: string; pageCount: number; pages?: string[] }> {
  const filename = file.name;
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  if (extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const { text, pageCount, pages } = await extractTextFromPdf(arrayBuffer);
    
    if (!text || text.trim().length === 0) {
      throw new Error(
        'This PDF appears to be a scanned image with no embedded text layer. Please use a text-based PDF or paste the contract text directly.'
      );
    }
    return { text, filename, pageCount, pages };
  }

  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const text = await extractTextFromDocx(arrayBuffer);
    return { text, filename, pageCount: Math.max(1, Math.ceil(text.length / 2500)) };
  }

  // Plain text formats (.txt, .md, .rtf, .json, etc.)
  const rawText = await file.text();
  
  // Guard against a user uploading a renamed binary file
  if (isBinaryGibberish(rawText)) {
    if (rawText.startsWith('%PDF-')) {
      const arrayBuffer = await file.arrayBuffer();
      const { text, pageCount, pages } = await extractTextFromPdf(arrayBuffer);
      return { text, filename, pageCount, pages };
    }
    throw new Error('The uploaded file contains unreadable binary data. Please upload a valid text, PDF, or Word document.');
  }

  const cleanText = sanitizeDocumentText(rawText);
  return { 
    text: cleanText, 
    filename, 
    pageCount: Math.max(1, Math.ceil(cleanText.length / 2500)) 
  };
}
