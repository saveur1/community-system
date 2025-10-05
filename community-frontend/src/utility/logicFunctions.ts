import type { User } from "@/api/auth";
import axios from 'axios';
import { cloudinaryName, cloudinaryUploadPreset } from "./validateEnvs";

export const spacer = (word: string) => {
  return word.replace(/[-_]/g, ' ');
};

export const checkPermissions = (user: User | null, permission: string) => {
  if (user?.roles[0].permissions?.some(p => p.name === permission)) {
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
  const cloudName = options?.cloudName ?? cloudinaryName;
  const uploadPreset = options?.uploadPreset ?? cloudinaryUploadPreset;
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
        try { options.onProgress!(percent); } catch { }
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
  const cloudName = params.cloudName ?? cloudinaryName;
  if (!deleteToken) throw new Error('Missing delete token for Cloudinary asset deletion');
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`;
  const form = new FormData();
  form.append('token', deleteToken);
  await axios.post(endpoint, form);
  return { ok: true } as const;
}

export const getDateRange = (period: string): { current: { start: Date; end: Date }; previous: { start: Date; end: Date } } => {
  const now = new Date(); // Current date: 2025-09-03 11:34 AM CAT
  let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

  if (period === "This week") {
    // Current week: Monday to current date
    currentStart = new Date(now);
    currentStart.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)); // Monday
    currentStart.setHours(0, 0, 0, 0);
    currentEnd = new Date(now);

    // Previous week: Monday to Sunday of the previous week
    previousStart = new Date(currentStart);
    previousStart.setDate(currentStart.getDate() - 7);
    previousEnd = new Date(previousStart);
    previousEnd.setDate(previousStart.getDate() + 6);
    previousEnd.setHours(23, 59, 59, 999);
  } else if (period === "This year") {
    // Current year: January 1 to current date
    currentStart = new Date(now.getFullYear(), 0, 1); // January 1, 2025
    currentStart.setHours(0, 0, 0, 0);
    currentEnd = new Date(now);

    // Previous year: January 1 to December 31 of last year
    previousStart = new Date(now.getFullYear() - 1, 0, 1); // January 1, 2024
    previousEnd = new Date(now.getFullYear() - 1, 11, 31); // December 31, 2024
    previousEnd.setHours(23, 59, 59, 999);
  } else {
    // Default case for undefined periods
    currentStart = new Date();
    currentEnd = new Date();
    previousStart = new Date();
    previousEnd = new Date();
  }

  return {
    current: { start: currentStart, end: currentEnd },
    previous: { start: previousStart, end: previousEnd },
  };
};

// Helper function to calculate delta
export const calculateDelta = (currentValue: number, previousValue: number): number => {
  if (previousValue === 0) return 0; // Avoid division by zero
  return Number(((currentValue - previousValue) / previousValue * 100).toFixed(2));
};

export const timeAgo = (iso?: string | null) => {
  if (!iso) return '-';
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

export const getResourceLink = (activity: string, resourceId: string) => {
  switch (activity) {
    case "responded_survey":
      return `/dashboard/surveys/take-survey/response/${resourceId}`;
    
    case "created_survey":
    case "updated_survey":
      return `/dashboard/surveys/${resourceId}`;

    case "created_announcement":
    case "updated_announcement":
      return `/dashboard/announcements`;

    case "updated_community_session":
    case "created_community_session":
      return `/dashboard/community-sessions/${resourceId}`;


    case "created_feedback":
      case "replied_feedback":
    case "updated_feedback":
      return `/dashboard/feedback?feedbackId=${resourceId}`;

    case "created_stakeholder":
    case "updated_stakeholder":
      return `/dashboard/stakeholders`;

    case "updated_user":
    case "created_user":
      return `/dashboard/accounts`;

    default:
      return `#`;
  }
}

export const getOptions = (options: any): string[] => {
  if (typeof options === 'string')
    return JSON.parse(options);
  return options;
}