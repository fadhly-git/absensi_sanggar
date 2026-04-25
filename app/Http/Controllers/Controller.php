<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;

abstract class Controller
{
    /**
     * Return a standardized success JSON response.
     */
    protected function successResponse($data = null, string $message = 'Berhasil', int $status = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $status);
    }

    /**
     * Return a standardized error JSON response and log the exception if provided.
     */
    protected function errorResponse(string $message = 'Gagal', \Exception $e = null, array $context = [], int $status = 500)
    {
        if ($e) {
            Log::error($message, array_merge([
                'user_id' => auth()->id() ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], $context));
            
            // On local environment, maybe pass error to response
            $errorDetails = app()->environment('local') ? $e->getMessage() : null;
        } else {
            Log::warning($message, $context);
            $errorDetails = null;
        }

        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => $errorDetails,
            'errors' => $context['errors'] ?? null
        ], $status);
    }
}
