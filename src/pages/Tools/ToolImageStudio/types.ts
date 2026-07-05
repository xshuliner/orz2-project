export type OutputFormat =
  | 'original'
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp';
export type ProcessPhase =
  | 'idle'
  | 'processing'
  | 'compressing'
  | 'done'
  | 'error';
export type BatchItemPhase =
  | 'idle'
  | 'processing'
  | 'compressing'
  | 'done'
  | 'error';
export type ResizeIntent = 'dimensions' | 'scale';

export interface ImageInfo {
  aspectRatio: string;
  height: number;
  lastModified: number;
  name: string;
  size: number;
  type: string;
  width: number;
}

export interface ProcessResult {
  blob: Blob;
  height: number;
  name: string;
  savingsRatio: number;
  size: number;
  source: 'browser' | 'tinypng';
  type: string;
  url: string;
  width: number;
}

export interface ProcessState {
  message: string;
  phase: ProcessPhase;
}

export interface BatchProcessItem {
  message: string;
  name: string;
  phase: BatchItemPhase;
  result?: ProcessResult;
}

export interface ReadImageFileResult {
  file: File;
  info: ImageInfo;
  previewUrl: string;
}
