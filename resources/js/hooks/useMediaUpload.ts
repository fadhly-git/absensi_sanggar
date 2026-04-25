import { useState, useCallback } from 'react';
import axios, { AxiosProgressEvent } from 'axios';

export interface UploadProgress {
  percentage: number;
  loaded: number;
  total: number;
  timeRemaining: number | null;
  speed: number | null;
}

export interface UploadResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UseMediaUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in MB
}

export const useMediaUpload = (options: UseMediaUploadOptions = {}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    percentage: 0,
    loaded: 0,
    total: 0,
    timeRemaining: null,
    speed: null,
  });

  const calculateTimeRemaining = (
    loaded: number,
    total: number,
    speed: number
  ): number => {
    const remaining = total - loaded;
    return Math.ceil(remaining / speed);
  };

  const formatSpeed = (bytesPerSecond: number): number => {
    return bytesPerSecond / 1024 / 1024; // Convert to MB/s
  };

  const uploadSingle = useCallback(
    async (
      file: File,
      altText?: string,
      caption?: string
    ): Promise<UploadResult> => {
      const maxSize = options.maxSize || 10;
      const maxBytes = maxSize * 1024 * 1024;

      if (file.size > maxBytes) {
        const error = `File terlalu besar. Maksimal ${maxSize}MB`;
        options.onError?.(error);
        return { success: false, error };
      }

      setUploading(true);
      setProgress({
        percentage: 0,
        loaded: 0,
        total: file.size,
        timeRemaining: null,
        speed: null,
      });

      const formData = new FormData();
      formData.append('file', file);
      if (altText) formData.append('alt_text', altText);
      if (caption) formData.append('caption', caption);

      let startTime = Date.now();
      let lastLoaded = 0;
      let lastTime = Date.now();

      try {
        const response = await axios.post('/atmin/cms/media/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const { loaded, total } = progressEvent;

            if (!total) return;

            const currentTime = Date.now();
            const timeDiff = (currentTime - lastTime) / 1000; // in seconds
            const loadedDiff = loaded - lastLoaded;

            const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0;
            const timeRemaining = speed > 0 ? calculateTimeRemaining(loaded, total, speed) : null;
            const percentage = Math.round((loaded / total) * 100);

            const progressData: UploadProgress = {
              percentage,
              loaded,
              total,
              timeRemaining,
              speed: formatSpeed(speed),
            };

            setProgress(progressData);
            options.onProgress?.(progressData);

            lastLoaded = loaded;
            lastTime = currentTime;
          },
        });

        setUploading(false);

        if (response.data.success) {
          options.onSuccess?.(response.data.data);
          return { success: true, data: response.data.data };
        } else {
          const error = response.data.message || 'Upload gagal';
          options.onError?.(error);
          return { success: false, error };
        }
      } catch (error: any) {
        setUploading(false);
        const errorMessage =
          error.response?.data?.message || error.message || 'Upload gagal';
        options.onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [options]
  );

  const uploadMultiple = useCallback(
    async (
      files: File[],
      altTexts?: string[],
      captions?: string[]
    ): Promise<UploadResult> => {
      const maxFiles = 7;

      if (files.length > maxFiles) {
        const error = `Maksimal ${maxFiles} file sekaligus`;
        options.onError?.(error);
        return { success: false, error };
      }

      setUploading(true);
      setProgress({
        percentage: 0,
        loaded: 0,
        total: files.reduce((sum, f) => sum + f.size, 0),
        timeRemaining: null,
        speed: null,
      });

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files[]', file);
        if (altTexts?.[index]) {
          formData.append(`alt_texts[${index}]`, altTexts[index]);
        }
        if (captions?.[index]) {
          formData.append(`captions[${index}]`, captions[index]);
        }
      });

      let startTime = Date.now();
      let lastLoaded = 0;
      let lastTime = Date.now();

      try {
        const response = await axios.post(
          '/atmin/cms/media/api/upload-multiple',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              const { loaded, total } = progressEvent;

              if (!total) return;

              const currentTime = Date.now();
              const timeDiff = (currentTime - lastTime) / 1000;
              const loadedDiff = loaded - lastLoaded;

              const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0;
              const timeRemaining = speed > 0 ? calculateTimeRemaining(loaded, total, speed) : null;
              const percentage = Math.round((loaded / total) * 100);

              const progressData: UploadProgress = {
                percentage,
                loaded,
                total,
                timeRemaining,
                speed: formatSpeed(speed),
              };

              setProgress(progressData);
              options.onProgress?.(progressData);

              lastLoaded = loaded;
              lastTime = currentTime;
            },
          }
        );

        setUploading(false);

        if (response.data.success) {
          options.onSuccess?.(response.data.data);
          return { success: true, data: response.data.data };
        } else {
          const error = response.data.message || 'Upload gagal';
          options.onError?.(error);
          return {
            success: false,
            error,
            data: {
              uploaded: response.data.data,
              errors: response.data.errors
            }
          };
        }
      } catch (error: any) {
        setUploading(false);
        const errorMessage =
          error.response?.data?.message || error.message || 'Upload gagal';
        options.onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [options]
  );

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return 'Menghitung...';
    if (seconds < 60) return `${seconds} detik`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}d`;
  };

  return {
    uploading,
    progress,
    uploadSingle,
    uploadMultiple,
    formatBytes,
    formatTime,
  };
};
