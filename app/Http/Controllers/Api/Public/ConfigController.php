<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ConfigController extends Controller
{
    /**
     * Get public site configuration
     */
    public function index(): JsonResponse
    {
        $school = config('payment.school');
        $whatsapp = config('payment.whatsapp');

        // Remove + and spaces from whatsapp
        $whatsappClean = preg_replace('/[^0-9]/', '', $whatsapp);

        $bankAccounts = collect(config('payment.bank_accounts'))
            ->filter(fn($bank) => $bank['is_active'] ?? true)
            ->map(function($bank) {
                return [
                    'id' => $bank['id'] ?? null,
                    'bank_name' => $bank['bank_name'],
                    'account_number' => $bank['account_number'],
                    'account_holder' => $bank['account_holder'],
                    'logo' => $bank['logo'] ?? null,
                    'is_active' => $bank['is_active'] ?? true,
                ];
            })
            ->values()
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'school_name' => $school['name'] ?? 'Sanggar Tari',
                'school_address' => $school['address'] ?? null,
                'school_logo' => $school['logo'] ?? null,
                'whatsapp' => $whatsappClean,
                'whatsapp_formatted' => $whatsapp,
                'bank_accounts' => $bankAccounts,
            ],
        ]);
    }
}
