
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
  languages: OcrLanguage[]
  // progressCallback parameter removed
): Promise<string> {
  const tesseractLangs = languages.join('+');
  if (!tesseractLangs) {
    throw new Error("No OCR languages selected.");
  }

  const currentWorker = await getWorker();
  
  // Ensure languages are loaded for the current job
  await currentWorker.loadLanguage(tesseractLangs);
  await currentWorker.initialize(tesseractLangs);
  
  // Call recognize without the third 'jobOutputOptions' argument that contained the logger.
  // Tesseract.js allows recognize(image, options).
  // The error was consistently pointing to the logger function.
  const { data } = await currentWorker.recognize(imageDataUrl, {}); 
  
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

