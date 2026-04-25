import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { UploadProgress } from '@/hooks/useMediaUpload';

interface UploadProgressBarProps {
  progress: UploadProgress;
  fileName?: string;
  status?: 'uploading' | 'success' | 'error';
  error?: string;
}

export function UploadProgressBar({
  progress,
  fileName,
  status = 'uploading',
  error,
}: UploadProgressBarProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return 'Menghitung...';
    if (seconds < 1) return 'Sebentar lagi...';
    if (seconds < 60) return `${seconds} detik lagi`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}d lagi`;
  };

  const formatSpeed = (mbps: number | null): string => {
    if (mbps === null) return '';
    if (mbps < 1) return `${(mbps * 1024).toFixed(1)} KB/s`;
    return `${mbps.toFixed(2)} MB/s`;
  };

  return (
    <div className="w-full space-y-2 rounded-lg border border-border bg-card p-4">
      {/* File Name */}
      {fileName && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground truncate">
            {fileName}
          </p>
          {status === 'uploading' && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
        </div>
      )}

      {/* Progress Bar */}
      <Progress value={progress.percentage} className="h-2" />

      {/* Progress Details */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">{progress.percentage}%</span>
        <span>
          {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
        </span>
      </div>

      {/* Speed & Time Remaining */}
      {status === 'uploading' && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {progress.speed !== null && (
            <span>{formatSpeed(progress.speed)}</span>
          )}
          {progress.timeRemaining !== null && (
            <span className="font-medium">{formatTime(progress.timeRemaining)}</span>
          )}
        </div>
      )}

      {/* Success Message */}
      {status === 'success' && (
        <p className="text-xs text-green-600 dark:text-green-400">
          Upload berhasil!
        </p>
      )}

      {/* Error Message */}
      {status === 'error' && error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
