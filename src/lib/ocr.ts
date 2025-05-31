
import { createWorker, Worker, LogMessage } from 'tesseract.js';
import type { OcrLanguage } from '@/types';

let worker: Worker | null = null;
let workerReady = false;

async function getWorker(): Promise<Worker> {
  if (worker && workerReady) {
    return worker;
  }
  
  if (worker && !workerReady) { // Worker is initializing
    await new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (workerReady) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
    return worker!;
  }

  worker = await createWorker();
  workerReady = false; // Set to false until languages are loaded
  
  // Languages will be loaded dynamically in recognizeText
  workerReady = true; 
  return worker;
}


export async function recognizeText(
  imageDataUrl: string,
  languages: OcrLanguage[],
  progressCallback?: (progress: number) => void
): Promise<string> {
  const tesseractLangs = languages.join('+');
  if (!tesseractLangs) {
    throw new Error("No OCR languages selected.");
  }

  const currentWorker = await getWorker();
  
  // Ensure languages are loaded for the current job
  await currentWorker.loadLanguage(tesseractLangs);
  await currentWorker.initialize(tesseractLangs);
  
  // This will be the third argument to recognize.
  // It's either undefined or an object with a logger property.
  let jobOutputOptions: { logger: (m: LogMessage) => void } | undefined = undefined;

  if (progressCallback) {
    // Explicitly capture the progressCallback to ensure a clean closure
    // and to satisfy type checking if progressCallback could be undefined here.
    const capturedProgressCallback = progressCallback; 
    jobOutputOptions = {
      logger: (m: LogMessage) => { // m is of type Tesseract.LogMessage
        if (m.status === 'recognizing text' && typeof m.progress === 'number') {
          capturedProgressCallback(Math.floor(m.progress * 100));
        }
      },
    };
  }

  // The second argument to recognize is for OCR-specific options (e.g., whitelist).
  // The third argument is for job output options, like the logger.
  // If jobOutputOptions is undefined, Tesseract.js should use its defaults.
  const { data } = await currentWorker.recognize(imageDataUrl, {}, jobOutputOptions);
  
  return data.text;
}

// Optional: function to terminate worker manually if app is closing or idle for too long
export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
    workerReady = false;
  }
}
