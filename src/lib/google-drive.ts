/**
 * Google Drive Picker & Shared Link Parser Helper
 */

export interface GoogleDriveAttachment {
  provider: 'google-drive';
  fileId: string;
  name: string;
  mimeType: string;
  url: string;
}

/**
 * Extracts the file ID from a Google Drive shared link.
 * Supports standard format: /file/d/FILE_ID/view...
 * and legacy/short format: ?id=FILE_ID
 */
export function parseGoogleDriveLink(url: string): { fileId: string | null; parsedUrl: string } {
  const fileIdRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const idParamRegex = /[?&]id=([a-zA-Z0-9_-]+)/;

  let fileId: string | null = null;
  const match1 = url.match(fileIdRegex);
  if (match1 && match1[1]) {
    fileId = match1[1];
  } else {
    const match2 = url.match(idParamRegex);
    if (match2 && match2[1]) {
      fileId = match2[1];
    }
  }

  // Normalize url format
  let parsedUrl = url;
  if (fileId && !url.includes('drive.google.com')) {
    parsedUrl = `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`;
  }

  return { fileId, parsedUrl };
}

// Global script loader helper
let gisLoaded = false;
let gapiLoaded = false;

export function loadGoogleScripts(): Promise<boolean> {
  return new Promise((resolve) => {
    if (gisLoaded && gapiLoaded) {
      resolve(true);
      return;
    }

    const checkLoad = () => {
      if (gisLoaded && gapiLoaded) {
        resolve(true);
      }
    };

    if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.async = true;
      gisScript.defer = true;
      gisScript.onload = () => {
        gisLoaded = true;
        checkLoad();
      };
      document.body.appendChild(gisScript);
    } else {
      gisLoaded = true;
    }

    if (!document.querySelector('script[src="https://apis.google.com/js/api.js"]')) {
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.async = true;
      gapiScript.defer = true;
      gapiScript.onload = () => {
        // Initialize gapi
        (window as any).gapi.load('client:picker', () => {
          gapiLoaded = true;
          checkLoad();
        });
      };
      document.body.appendChild(gapiScript);
    } else {
      gapiLoaded = true;
      checkLoad();
    }
  });
}
