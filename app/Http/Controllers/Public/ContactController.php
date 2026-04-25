<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ContactController extends Controller
{
    /**
     * Store a new contact message
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'recaptcha_token' => 'required|string',
        ]);

        // Verify reCAPTCHA v2
        $recaptchaResponse = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => config('services.recaptcha.secret_key'),
            'response' => $validated['recaptcha_token'],
            'remoteip' => $request->ip(),
        ]);

        if (!$recaptchaResponse->json('success')) {
            return response()->json([
                'success' => false,
                'message' => 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.',
            ], 422);
        }

        ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesan Anda berhasil dikirim. Kami akan segera menghubungi Anda.',
        ]);
    }
}
