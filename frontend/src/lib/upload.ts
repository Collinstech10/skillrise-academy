// Direct upload to Supabase Storage from browser
// This bypasses the backend entirely — no Railway size limits

const SUPABASE_URL = 'https://cpvoaxhzzjygiieidqds.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwdm9heGh6emp5Z2lpZWlkcWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMjI4MjMsImV4cCI6MjA5NjY5ODgyM30.vPlN1VCM2hYlfZ_6aalY_4oRSOYz_o2ep1fnUcLD0xc';

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export async function uploadToSupabase(
  file: File,
  folder: 'thumbnails' | 'videos' | 'pdfs',
  fileName: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const path = `${folder}/${fileName}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percent: Math.round((e.loaded / e.total) * 100),
          });
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        // Get public URL
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/skillrise/${path}`;
        resolve(publicUrl);
      } else {
        // Try to parse error
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    // Use Supabase Storage REST API directly
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/skillrise/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    xhr.send(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
