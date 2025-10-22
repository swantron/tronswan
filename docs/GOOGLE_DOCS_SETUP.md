# Google Docs API Setup for Dynamic Resume

This guide explains how to set up the Google Docs API to dynamically load resume content from your Google Doc.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. Your Google Doc ID: `1zeZ_mN27_KVgUuOovUn4nHb_w8CDRUBrj5xOiIVTz8M`

## Setup Steps

### 1. Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Google Drive API"
5. Click on it and press "Enable"

**Note**: We're using the Google Drive API export endpoint, which supports API keys and doesn't require OAuth2.

### 2. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key (it will be a simple string like `AIzaSyB...`)
4. (Optional) Restrict the API key to only work with Google Docs API:
   - Click on the API key you just created
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Docs API" from the list
   - Click "Save"

### 3. Make Your Google Doc Public

1. Open your Google Doc: https://docs.google.com/document/d/1zeZ_mN27_KVgUuOovUn4nHb_w8CDRUBrj5xOiIVTz8M/edit
2. Click "Share" in the top right
3. Change permissions to "Anyone with the link can view"
4. Click "Done"

### 4. Add Environment Variable

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your API key:

```bash
VITE_GOOGLE_DOCS_API_KEY=your_api_key_here
```

### 5. Restart Your Development Server

```bash
npm run dev
# or
yarn dev
```

## How It Works

- The resume page will automatically fetch content from your Google Doc
- Updates to your Google Doc will be reflected on the website
- If the API is unavailable, it falls back to a template
- Users can click "Refresh Content" to manually reload the latest version

## Troubleshooting

### API Key Issues

- Make sure the API key is correctly set in `.env.local`
- Ensure the Google Docs API is enabled in your Google Cloud project
- Check that the API key has the correct permissions

### Document Access Issues

- Verify the Google Doc is set to "Anyone with the link can view"
- Check that the document ID is correct in the service

### Fallback Content

- If the API fails, the site will show a template with instructions
- This ensures the resume page always works, even without API access

## Security Notes

- The API key is exposed in the client-side code (this is normal for public APIs)
- Consider restricting the API key to only work with the Google Docs API
- The document should be public anyway since it's a resume

## Testing

Run the tests to ensure everything works:

```bash
npm test
# or
yarn test
```
