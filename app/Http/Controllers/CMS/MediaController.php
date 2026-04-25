<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class MediaController extends Controller
{
    /**
     * Get all media
     */
    public function index(Request $request)
    {
        $query = Media::with('uploader:id,name')
            ->recent();

        // Filter by type
        if ($request->has('type')) {
            switch ($request->type) {
                case 'images':
                    $query->images();
                    break;
                case 'videos':
                    $query->videos();
                    break;
            }
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('original_filename', 'like', "%{$search}%")
                    ->orWhere('alt_text', 'like', "%{$search}%")
                    ->orWhere('caption', 'like', "%{$search}%");
            });
        }

        $media = $query->paginate($request->get('per_page', 24));

        return response()->json($media);
    }

    /**
     * Upload single file
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max before compression
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
        ]);

        try {
            $file = $request->file('file');
            $media = $this->processUpload($file, $request->alt_text, $request->caption);

            return response()->json([
                'success' => true,
                'message' => 'File berhasil diupload',
                'data' => $media,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupload file: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload multiple files
     */
    public function uploadMultiple(Request $request)
    {
        $request->validate([
            'files' => 'required|array|max:7',
            'files.*' => 'required|file|max:10240', // 10MB max before compression
        ]);

        try {
            $uploadedMedia = [];
            $errors = [];

            foreach ($request->file('files') as $index => $file) {
                try {
                    $media = $this->processUpload(
                        $file,
                        $request->input("alt_texts.{$index}"),
                        $request->input("captions.{$index}")
                    );
                    $uploadedMedia[] = $media;
                } catch (\Exception $e) {
                    $errors[] = [
                        'file' => $file->getClientOriginalName(),
                        'error' => $e->getMessage(),
                    ];
                }
            }

            return response()->json([
                'success' => count($errors) === 0,
                'message' => count($errors) === 0
                    ? 'Semua file berhasil diupload'
                    : 'Beberapa file gagal diupload',
                'data' => $uploadedMedia,
                'errors' => $errors,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupload files: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process file upload with compression
     */
    private function processUpload($file, $altText = null, $caption = null)
    {
        $originalName = $file->getClientOriginalName();
        $originalExtension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType();

        // Generate unique filename
        $filename = Str::slug(pathinfo($originalName, PATHINFO_FILENAME))
            . '-' . Str::random(8);

        // Check if it's an image
        if (str_starts_with($mimeType, 'image/')) {
            return $this->processImage($file, $filename, $originalName, $altText, $caption);
        } else {
            return $this->processFile($file, $filename, $originalName, $mimeType, $originalExtension, $altText, $caption);
        }
    }

    /**
     * Process and compress image
     */
    private function processImage($file, $filename, $originalName, $altText, $caption)
    {
        // Convert to WebP
        $filename .= '.webp';
        $path = 'media/' . date('Y/m') . '/' . $filename;

        // Process image
        $image = Image::make($file);
        $width = $image->width();
        $height = $image->height();

        // Resize if too large (max 1920px width)
        if ($width > 1920) {
            $image->resize(1920, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
            $width = 1920;
            $height = $image->height();
        }

        // Encode to WebP with quality 85
        $encoded = $image->encode('webp', 85);

        // Store the image
        Storage::disk('public')->put($path, $encoded);

        $size = Storage::disk('public')->size($path);

        // Create media record
        return Media::create([
            'filename' => $filename,
            'original_filename' => $originalName,
            'path' => $path,
            'disk' => 'public',
            'mime_type' => 'image/webp',
            'extension' => 'webp',
            'size' => $size,
            'width' => $width,
            'height' => $height,
            'alt_text' => $altText,
            'caption' => $caption,
            'uploaded_by' => auth()->id(),
        ]);
    }

    /**
     * Process non-image file
     */
    private function processFile($file, $filename, $originalName, $mimeType, $extension, $altText, $caption)
    {
        $filename .= '.' . $extension;
        $path = 'media/' . date('Y/m') . '/' . $filename;

        // Store file
        Storage::disk('public')->putFileAs(
            'media/' . date('Y/m'),
            $file,
            $filename
        );

        $size = $file->getSize();

        // Create media record
        return Media::create([
            'filename' => $filename,
            'original_filename' => $originalName,
            'path' => $path,
            'disk' => 'public',
            'mime_type' => $mimeType,
            'extension' => $extension,
            'size' => $size,
            'width' => null,
            'height' => null,
            'alt_text' => $altText,
            'caption' => $caption,
            'uploaded_by' => auth()->id(),
        ]);
    }

    /**
     * Update media metadata
     */
    public function update(Request $request, Media $media)
    {
        $request->validate([
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
        ]);

        $media->update($request->only(['alt_text', 'caption']));

        return response()->json([
            'success' => true,
            'message' => 'Media berhasil diupdate',
            'data' => $media,
        ]);
    }

    /**
     * Delete media
     */
    public function destroy(Media $media)
    {
        try {
            $media->delete(); // Will trigger model's deleting event to delete file

            return response()->json([
                'success' => true,
                'message' => 'Media berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus media: ' . $e->getMessage(),
            ], 500);
        }
    }
}
