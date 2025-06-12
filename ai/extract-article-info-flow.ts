'use server';
/**
 * @fileOverview AI agent that extracts title, summary, and a relevant image URL from a given URL.
 *
 * - extractArticleInfo - A function that extracts article information.
 * - ExtractArticleInfoInput - The input type for the extractArticleInfo function.
 * - ExtractArticleInfoOutput - The return type for the extractArticleInfo function.
 */

import {ai} from './genkit';
import {z} from 'zod';

const ExtractArticleInfoInputSchema = z.object({
  articleUrl: z.string().url().describe('The URL of the article to process.'),
});
export type ExtractArticleInfoInput = z.infer<typeof ExtractArticleInfoInputSchema>;

// Schema for the AI model's direct output.
// For `imageUrl`, AI is instructed to return "" for no image to prevent API schema issues.
const ModelOutputSchema = z.object({
  title: z.string().describe('The extracted title of the article. If extraction fails, use the base of the URL itself (e.g., "https://www.google.com" -> "Google").'),
  summary: z.string().describe('A concise summary of the article content. If extraction fails, use (e.g., "no summary available").'),
  imageUrl: z.string().describe('The full URL of the most relevant image from the article. MUST be an empty string "" if no suitable image is found, if image URLs cannot be accessed, or if the main extraction fails.'),
  dataAiHint: z.string().max(50).describe('two to four keywords describing the article content (e.g., "technology abstract", "mountain landscape"). Used for placeholder image services. If no image, base on article topic. If extraction fails, use an empty string.'),
});

// Schema for the `extractArticleInfo` function's final, processed output.
// `imageUrl` can be `null` here.
// This schema is NOT exported directly from this "use server" file.
const ExtractArticleInfoOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  imageUrl: z.string().url().nullable(), // Validated as URL or null by the flow.
  dataAiHint: z.string().max(50),
});
export type ExtractArticleInfoOutput = z.infer<typeof ExtractArticleInfoOutputSchema>;


export async function extractArticleInfo(input: ExtractArticleInfoInput): Promise<ExtractArticleInfoOutput> {
  return extractArticleInfoFlow(input);
}

const extractArticleInfoPrompt = ai.definePrompt({
  name: 'extractArticleInfoPrompt',
  input: {schema: ExtractArticleInfoInputSchema},
  output: {schema: ModelOutputSchema}, // Use the simpler schema for the AI model
  prompt: `You are an expert at extracting information from web pages.
Given the following URL, please extract the following fields. You MUST provide a value for every field as specified.

1.  \`title\`: The extracted title of the article. If extraction fails, use the base of the URL itself (e.g., "https://www.google.com" -> "Google").
2.  \`summary\`: A concise summary of the article content. If extraction fails, use (e.g., "no summary available").
3.  \`imageUrl\`: The full URL of the most relevant image from the article. MUST be an empty string "" if no suitable image is found, if image URLs cannot be accessed, or if the main extraction fails.
4.  \`dataAiHint\`: two to four keywords describing the article content (e.g., "technology abstract", "mountain landscape"). Used for placeholder image services. If no image, base on article topic. If extraction fails, use an empty string.

Article URL: {{{articleUrl}}}

Your response MUST conform to the output schema. All fields in the schema are required.
If you cannot access the URL or extract title and summary, you MUST still provide a string for title and summary indicating the failure, imageUrl as an empty string "", and dataAiHint as a generic error string like "extraction error".
`,
});

const extractArticleInfoFlow = ai.defineFlow(
  {
    name: 'extractArticleInfoFlow',
    inputSchema: ExtractArticleInfoInputSchema,
    outputSchema: ExtractArticleInfoOutputSchema, // Flow validates against this richer schema
  },
  async (input): Promise<ExtractArticleInfoOutput> => {
    const llmResponse = await extractArticleInfoPrompt(input);
    // llmResponse.output is of type z.infer<typeof ModelOutputSchema>
    const modelOutput = llmResponse.output;

    if (!modelOutput) {
        // This case implies the model failed to produce output matching the ModelOutputSchema.
        return {
            title: "Extraction Failed: Model Error",
            summary: "The AI model encountered an error and could not process the URL.",
            imageUrl: null,
            dataAiHint: "model error",
        };
    }

    // Process title (should be string as per ModelOutputSchema)
    const finalTitle = (typeof modelOutput.title === 'string' && modelOutput.title.trim() !== '') 
        ? modelOutput.title
        : "Extraction Failed: Invalid Title From Model";
    
    // Process summary (should be string as per ModelOutputSchema)
    const finalSummary = (typeof modelOutput.summary === 'string' && modelOutput.summary.trim() !== '')
        ? modelOutput.summary
        : "Extraction Failed: Invalid Summary From Model";
        
    // Process imageUrl (string from model, potentially empty, convert to string | null)
    let processedImageUrl: string | null = null;
    if (modelOutput.imageUrl && typeof modelOutput.imageUrl === 'string' && modelOutput.imageUrl.trim() !== "") {
      try {
        // Validate if it's a URL structure. The .url() in ExtractArticleInfoOutputSchema will re-validate.
        new URL(modelOutput.imageUrl); 
        processedImageUrl = modelOutput.imageUrl;
      } catch (e) {
        // AI returned a non-empty string that's not a valid URL. Treat as no image.
        processedImageUrl = null;
      }
    } // If modelOutput.imageUrl is "" or whitespace only, processedImageUrl remains null.

    // Process dataAiHint (string from model)
    // Ensure it's not empty after trimming, and provide a fallback.
    const finalDataAiHint = (typeof modelOutput.dataAiHint === 'string' && modelOutput.dataAiHint.trim() !== '') 
        ? modelOutput.dataAiHint.substring(0, 50).trim()
        : "content hint";


    // If overall extraction failed (indicated by title), ensure imageUrl is null.
    const titleIndicatesFailure = finalTitle.toLowerCase().includes("extraction failed");
    if (titleIndicatesFailure) {
        processedImageUrl = null;
        // dataAiHint should already be set to an error hint by the prompt in this case.
        // If it wasn't, the fallback above or a more specific one here could apply.
        // e.g. if (titleIndicatesFailure && finalDataAiHint === "content hint") finalDataAiHint = "extraction error";
    }
    
    const result: ExtractArticleInfoOutput = {
      title: finalTitle,
      summary: finalSummary,
      imageUrl: processedImageUrl,
      dataAiHint: finalDataAiHint || (titleIndicatesFailure ? "extraction error" : "general content"), // Ensure dataAiHint is never empty
    };
    
    // Zod will validate this result against ExtractArticleInfoOutputSchema upon return.
    return result;
  }
); 