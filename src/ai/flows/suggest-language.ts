'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests the language(s) present in an image.
 *
 * - suggestLanguage - A function that takes an image data URI and returns a suggested language or combination of languages.
 * - SuggestLanguageInput - The input type for the suggestLanguage function.
 * - SuggestLanguageOutput - The return type for the suggestLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLanguageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Ensure correct format
    ),
});
export type SuggestLanguageInput = z.infer<typeof SuggestLanguageInputSchema>;

const SuggestLanguageOutputSchema = z.object({
  suggestedLanguages: z
    .array(z.enum(['en', 'am', 'or', 'ti']))
    .describe('An array of suggested language codes (en, am, or, ti) present in the image.'),
});
export type SuggestLanguageOutput = z.infer<typeof SuggestLanguageOutputSchema>;

export async function suggestLanguage(input: SuggestLanguageInput): Promise<SuggestLanguageOutput> {
  return suggestLanguageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLanguagePrompt',
  input: {schema: SuggestLanguageInputSchema},
  output: {schema: SuggestLanguageOutputSchema},
  prompt: `You are an expert in identifying languages from images containing text.
  Given the image, determine the language(s) present. You must return an array of language codes. Available languages are:
  - English (en)
  - Amharic (am)
  - Oromo (or)
  - Tigrinya (ti)

  If you identify more than one language, return all applicable languages in the array.
  If you are unsure, make your best guess.

  Image: {{media url=photoDataUri}}
  `, // Correctly use media helper
});

const suggestLanguageFlow = ai.defineFlow(
  {
    name: 'suggestLanguageFlow',
    inputSchema: SuggestLanguageInputSchema,
    outputSchema: SuggestLanguageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
