import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** The standard shadcn class merger, scoped to presentational class composition. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
