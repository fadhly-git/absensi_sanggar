<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Mail\ContactReplyMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactMessageController extends Controller
{
    /**
     * List all contact messages (paginated)
     */
    public function index(Request $request)
    {
        $query = ContactMessage::with('replier:id,name')->orderBy('created_at', 'desc');

        if ($request->filled('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        $messages = $query->paginate(20);

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
                'unread_count' => ContactMessage::unread()->count(),
            ],
        ]);
    }

    /**
     * Mark a message as read
     */
    public function markRead(ContactMessage $contactMessage)
    {
        try {
            $contactMessage->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Pesan berhasil ditandai sebagai dibaca',
                'data' => $contactMessage,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menandai pesan sebagai dibaca: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a message
     */
    public function destroy(ContactMessage $contactMessage)
    {
        try {
            $contactMessage->delete();

            return response()->json([
                'success' => true,
                'message' => 'Pesan berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pesan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reply to a message via email
     */
    public function reply(Request $request, ContactMessage $contactMessage)
    {
        $validated = $request->validate([
            'reply_body' => 'required|string',
        ]);

        try {
            $replierName = auth()->user()->name;
            // Fetch settings for Mail template, fallback to defaults if not available
            $siteTagLine = \App\Models\SiteSetting::where('key', 'site_description')->value('value') ?? 'Sanggar Tari Tradisional';
            $siteUrl = config('app.url');

            Mail::to($contactMessage->email)->send(
                new ContactReplyMail(
                    $contactMessage->name,
                    $contactMessage->message,
                    $validated['reply_body'],
                    $replierName,
                    $contactMessage->subject ?? 'Pesan Anda',
                    $siteTagLine,
                    $siteUrl
                )
            );

            $contactMessage->update([
                'is_read' => true,
                'replied_at' => now(),
                'replied_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Balasan berhasil dikirim',
                'data' => $contactMessage->load('replier:id,name'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim balasan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
