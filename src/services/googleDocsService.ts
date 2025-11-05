// Google Docs API service for fetching resume content
// Note: This requires setting up Google Docs API credentials

// Using Google Docs Export API which returns plain text

import { logger } from '../utils/logger';

export class GoogleDocsService {
  private static readonly DOCUMENT_ID =
    '1zeZ_mN27_KVgUuOovUn4nHb_w8CDRUBrj5xOiIVTz8M';

  static async getResumeContent(): Promise<string> {
    try {
      // Read API key inside method to allow tests to stub environment variables
      const apiKey = import.meta.env.VITE_GOOGLE_DOCS_API_KEY;
      logger.debug('Google Docs API Key status', { hasKey: !!apiKey });
      if (!apiKey) {
        logger.warn('Google Docs API key not found. Using fallback content.');
        return this.getFallbackContent();
      }

      // Use the Drive API export endpoint instead of the Docs API
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${this.DOCUMENT_ID}/export?mimeType=text/plain&key=${apiKey}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.apiError(
          'GoogleDocs',
          'getResumeContent',
          new Error(`API error: ${response.status}`),
          { status: response.status, errorText }
        );
        throw new Error(
          `Google Docs API error: ${response.status} - ${errorText}`
        );
      }

      const content = await response.text();
      logger.info('Successfully fetched Google Doc content');
      return content;
    } catch (error) {
      logger.apiError(
        'GoogleDocs',
        'getResumeContent',
        error instanceof Error ? error : new Error('Unknown error')
      );
      return this.getFallbackContent();
    }
  }

  // No need for parsing since export API returns plain text directly

  private static getFallbackContent(): string {
    return `
# Resume Template

## Contact Information
- Email: your.email@example.com
- Website: yourwebsite.com
- LinkedIn: linkedin.com/in/yourprofile
- Location: Your City, State

## Professional Summary
[Replace with your actual professional summary from your Google Doc]

## Technical Skills
[Your actual technical skills from Google Doc]

## Professional Experience
[Your actual work experience from Google Doc]

## Education
[Your actual education from Google Doc]

## Projects & Achievements
[Your actual projects from Google Doc]

## Certifications
[Your actual certifications from Google Doc]

---
*This content is loaded from your Google Doc. Update the document to see changes reflected here.*
    `.trim();
  }
}
