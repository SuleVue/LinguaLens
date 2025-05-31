# LinguaLens

This project is a Next.js application. It appears to be an Optical Character Recognition (OCR) workspace with image upload, text editing, language selection, and session management capabilities.

## Description

This application provides a user interface for performing OCR on uploaded images. Users can upload images, view the extracted text, edit the text, select the language of the text for potential processing (likely translation or further analysis), and manage sessions. The integration with Firebase suggests potential features like user authentication, data storage (for sessions and images), or cloud functions for OCR processing.

## Features

*   **Image Upload:** Allows users to upload images for OCR.
*   **OCR Processing:** Extracts text from uploaded images.
*   **Editable Text Area:** Provides an interface to view and modify the extracted text.
*   **Language Selection:** Enables users to specify the language of the text, potentially for improved OCR accuracy or subsequent language-based tasks.
*   **Session Management:** Supports managing user sessions, likely for saving and retrieving work.
*   **Responsive Design:** Includes hooks for detecting mobile devices, suggesting a responsive user interface.
*   **UI Components:** Utilizes a set of UI components for building the user interface.

## Technologies Used

*   **Next.js:** React framework for server-side rendering and static site generation.
*   **Firebase Studio:** Development environment and tools for building applications with Firebase.
*   **React:** JavaScript library for building user interfaces.
*   **TypeScript:** Typed superset of JavaScript.
*   **Tailwind CSS:** Utility-first CSS framework for styling.
*   **Genkit (src/ai/genkit.ts):** Suggests the use of Genkit, potentially for AI/ML tasks related to OCR or language processing.
*   **Other Libraries/Frameworks:** The presence of various UI component files (`src/components/ui/*`) indicates the use of a UI library (e.g., Shadcn UI based on the file names).

## Setup

To set up the project locally, follow these steps:

1.  **Clone the repository:**

