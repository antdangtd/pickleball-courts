//src/lib/utils.ts
// This file contains utility functions that are used throughout the application. The cn function is a utility function that merges class names using the clsx and tailwind-merge libraries.

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
