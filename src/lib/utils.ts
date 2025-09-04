import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hardcodedSupabaseParticipants = {
  host: {
    id: "763e07ad-2d49-4dab-8d5f-fb0b505da275",
  },
  nonHost: {
    id: "76e6aaa3-1dbe-451c-b8e6-6cb87366d0fe",
  },
};

export const hardcodedAwsParticipants = {
  host: {
    id: "344ee8e6-537a-4c5d-ae98-593e7c4e6a5f",
  },
  nonHost: {
    id: "036ca3fe-e32d-4412-941e-750521ba311c",
  },
};

export function capitalToLower(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => capitalToLower(item));
  }

  const transformed: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = key.charAt(0).toLowerCase() + key.slice(1);

    if (value !== null && typeof value === "object") {
      transformed[newKey] = capitalToLower(value);
    } else {
      transformed[newKey] = value;
    }
  }

  return transformed;
}

export function lowerToCapital(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => lowerToCapital(item));
  }

  const transformed: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = key.charAt(0).toUpperCase() + key.slice(1);

    if (value !== null && typeof value === "object") {
      transformed[newKey] = lowerToCapital(value);
    } else {
      transformed[newKey] = value;
    }
  }

  return transformed;
}
