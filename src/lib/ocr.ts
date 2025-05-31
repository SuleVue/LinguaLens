import { createWorker, RecognizeResult, Worker } from 'tesseract.js';
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

  // Preload common languages or load them on demand later.
  // For simplicity, we will load them dynamically in the recognizeText function.
  // If performance is an issue, preload common languages here.
  // e.g. await worker.loadLanguage('eng');
  // await worker.initialize('eng');
  
  workerReady = true; // If no preloading, consider it ready.
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
  // Tesseract.js handles dynamic loading if not preloaded
  await currentWorker.loadLanguage(tesseractLangs);
  await currentWorker.initialize(tesseractLangs);
  
  // Optional: Set Tesseract parameters if needed
  // await currentWorker.setParameters({
  //   tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyz',
  // });

  const { data } = await currentWorker.recognize(imageDataUrl, {}, {
    logger: progressCallback ? (m) => {
      if (m.status === 'recognizing text') {
        progressCallback(Math.floor(m.progress * 100));
      }
    } : undefined,
  });
  
  // Optional: Terminate worker after each job to free resources if not frequently used
  // await currentWorker.terminate();
  // worker = null;
  // workerReady = false;

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
