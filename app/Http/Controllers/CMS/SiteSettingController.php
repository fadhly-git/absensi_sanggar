<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    /**
     * Get all settings grouped
     */
    public function index()
    {
        $settings = SiteSetting::query()->orderBy('group')->orderBy('key')->get();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update multiple settings
     */
    public function update(Request $request)
    {
        try {
            foreach ($request->all() as $key => $value) {
                SiteSetting::set($key, $value);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pengaturan berhasil disimpan',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan pengaturan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
