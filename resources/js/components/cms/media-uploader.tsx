import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMediaUpload, UploadProgress } from '@/hooks/useMediaUpload';
import { UploadProgressBar } from './upload-progress-bar';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaUploaderProps {
  onUploadSuccess?: (media: any | any[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  className?: string;
}

interface FileWithPreview {
  file: File;
  preview: string;
  altText?: string;
  caption?: string;
}

export function MediaUploader({
  onUploadSuccess,
  multiple = false,
  maxFiles = 7,
  accept = 'image/*',
  className,
}: MediaUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploading, progress, uploadSingle, uploadMultiple } = useMediaUpload({
    onProgress: (prog: UploadProgress) => {
      // Progress handled by component state
    },
    onSuccess: (data) => {
      toast.success('Upload berhasil!', {
        description: multiple
          ? `${Array.isArray(data) ? data.length : 1} file berhasil diupload`
          : 'File berhasil diupload',
      });
      onUploadSuccess?.(data);
      setFiles([]);
      setCurrentFileIndex(null);
    },
    onError: (error) => {
      toast.error('Upload gagal', {
        description: error,
      });
    },
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    if (multiple && selectedFiles.length > maxFiles) {
      toast.error('Terlalu banyak file', {
        description: `Maksimal ${maxFiles} file sekaligus`,
      });
      return;
    }

    const filesWithPreview = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      altText: '',
      caption: '',
    }));

    setFiles(filesWithPreview);
  }, [multiple, maxFiles]);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const handleUpdateFileData = useCallback((
    index: number,
    field: 'altText' | 'caption',
    value: string
  ) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = { ...newFiles[index], [field]: value };
      return newFiles;
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;

    setCurrentFileIndex(0);

    if (multiple) {
      const fileArray = files.map((f) => f.file);
      const altTexts = files.map((f) => f.altText || '');
      const captions = files.map((f) => f.caption || '');

      await uploadMultiple(fileArray, altTexts, captions);
    } else {
      const { file, altText, caption } = files[0];
      await uploadSingle(file, altText, caption);
    }
  }, [files, multiple, uploadSingle, uploadMultiple]);

  const handleCancelSelection = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [files]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* File Input */}
      {files.length === 0 && (
        <div className="space-y-2">
          <Label htmlFor="file-upload">
            {multiple ? 'Upload Gambar (Maksimal 7)' : 'Upload Gambar'}
          </Label>
          <div className="flex gap-2">
            <Input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              disabled={uploading}
              className="cursor-pointer"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Pilih File
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            File akan otomatis dikompres ke format WebP. Maksimal 5MB per file.
            {multiple && ` Pilih hingga ${maxFiles} file sekaligus.`}
          </p>
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && !uploading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{files.length} file dipilih</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelSelection}
            >
              <X className="mr-2 h-4 w-4" />
              Batalkan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((fileItem, index) => (
              <div
                key={index}
                className="space-y-2 rounded-lg border border-border p-4"
              >
                {/* Image Preview */}
                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                  {fileItem.file.type.startsWith('image/') ? (
                    <img
                      src={fileItem.preview}
                      alt={fileItem.file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* File Info */}
                <p className="text-sm font-medium truncate">
                  {fileItem.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {/* Alt Text */}
                <div className="space-y-1">
                  <Label htmlFor={`alt-${index}`} className="text-xs">
                    Alt Text (opsional)
                  </Label>
                  <Input
                    id={`alt-${index}`}
                    placeholder="Deskripsi gambar untuk SEO"
                    value={fileItem.altText}
                    onChange={(e) =>
                      handleUpdateFileData(index, 'altText', e.target.value)
                    }
                  />
                </div>

                {/* Caption */}
                <div className="space-y-1">
                  <Label htmlFor={`caption-${index}`} className="text-xs">
                    Caption (opsional)
                  </Label>
                  <Input
                    id={`caption-${index}`}
                    placeholder="Caption untuk gambar"
                    value={fileItem.caption}
                    onChange={(e) =>
                      handleUpdateFileData(index, 'caption', e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload {files.length} File
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && currentFileIndex !== null && (
        <UploadProgressBar
          progress={progress}
          fileName={
            multiple
              ? `Mengupload ${files.length} file...`
              : files[currentFileIndex]?.file.name
          }
          status="uploading"
        />
      )}
    </div>
  );
}
