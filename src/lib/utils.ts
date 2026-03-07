/**
 * Shared utility combining clsx and tailwind-merge.
 * Use cn() everywhere instead of template strings for Tailwind class merging.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
