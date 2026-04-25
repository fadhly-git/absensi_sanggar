<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\SocialLink;
use Illuminate\Http\Request;

class SocialLinkController extends Controller
{
    /**
     * Get all social links
     */
    public function index()
    {
        $links = SocialLink::ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $links,
        ]);
    }

    /**
     * Create new social link
     */
    public function store(Request $request)
    {
        $request->validate([
            'platform' => 'required|string|in:instagram,facebook,youtube,tiktok,twitter,linkedin,whatsapp',
            'url' => 'required|url',
        ]);

        try {
            $link = SocialLink::create([
                'platform' => $request->platform,
                'url' => $request->url,
                'order' => SocialLink::max('order') + 1,
                'is_active' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Social link berhasil ditambahkan',
                'data' => $link,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan social link: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update social link
     */
    public function update(Request $request, SocialLink $socialLink)
    {
        $request->validate([
            'platform' => 'required|string|in:instagram,facebook,youtube,tiktok,twitter,linkedin,whatsapp',
            'url' => 'required|url',
            'is_active' => 'boolean',
        ]);

        try {
            $socialLink->update($request->only(['platform', 'url', 'is_active']));

            return response()->json([
                'success' => true,
                'message' => 'Social link berhasil diupdate',
                'data' => $socialLink,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate social link: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete social link
     */
    public function destroy(SocialLink $socialLink)
    {
        try {
            $socialLink->delete();

            return response()->json([
                'success' => true,
                'message' => 'Social link berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus social link: ' . $e->getMessage(),
            ], 500);
        }
    }
}
