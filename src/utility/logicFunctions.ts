import { User } from "@/api/auth";
import axios from 'axios';

export const spacer = (word: string) => {
  return word.replace(/_/g, ' ');
}

export const checkPermissions=(user: User | null, permission: string) => {
  if(user?.roles[0].permissions?.some(p => p.name === permission)) {
    return true;
  }
  return false;
}

// Upload a file to Cloudinary using an unsigned upload preset
// Requires env vars: VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET (or pass via options)
export async function uploadToCloudinary(
  file: File,
  options?: { uploadPreset?: string; folder?: string; cloudName?: string; onProgress?: (percent: number) => void }
): Promise<{
  url: string;
  secureUrl: string;
  publicId: string;
  bytes: number;
  format?: string;
  originalFilename?: string;
  deleteToken?: string;
}> {
  const cloudName = options?.cloudName ?? import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = options?.uploadPreset ?? import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary config missing: set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);
  if (options?.folder) form.append('folder', options.folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  // Use axios to simplify progress reporting
  const response = await axios.post(endpoint, form, {
    onUploadProgress: (evt) => {
      if (evt.total && typeof options?.onProgress === 'function') {
        const percent = Math.round((evt.loaded / evt.total) * 100);
        try { options.onProgress!(percent); } catch {}
      }
    },
  });
  const data = response.data;

  console.log("cloudinary response", data);

  return {
    url: data.url,
    secureUrl: data.secure_url,
    publicId: data.public_id,
    bytes: data.bytes,
    format: data.format,
    originalFilename: data.original_filename,
    deleteToken: data.delete_token,
  };
}

// Delete a Cloudinary asset. Prefer delete_by_token when available (requires unsigned preset with return_delete_token=true).
// Delete strictly by token (client-side, unsigned)
export async function deleteCloudinaryAsset(params: { deleteToken: string; cloudName?: string }) {
  const { deleteToken } = params;
  const cloudName = params.cloudName ?? import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!deleteToken) throw new Error('Missing delete token for Cloudinary asset deletion');
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`;
  const form = new FormData();
  form.append('token', deleteToken);
  await axios.post(endpoint, form);
  return { ok: true } as const;
}