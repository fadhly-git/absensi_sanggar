<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\Keuangan;
use App\Models\Absensi;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function getSummary(Request $request)
    {
        // Debug logging untuk troubleshooting
        Log::info('Dashboard summary requested', [
            'user_id' => Auth::id(),
            'auth_check' => Auth::check(),
            'user_agent' => $request->userAgent(),
            'session_id' => $request->session()->getId(),
        ]);

        // Pastikan user authenticated
        if (!Auth::check()) {
            Log::warning('Unauthorized dashboard summary request');
            return response()->json([
                'message' => 'Unauthorized - Please login first'
            ], 401);
        }

        $user = Auth::user();
        Log::info("Dashboard summary accessed by user: {$user->id}");

        try {
            // Data Siswa
            $totalSiswa = Siswa::count();
            $siswaAktif = Siswa::where('status', 1)->count();

            // Data Saldo dengan perbandingan
            $saldoTerakhir = Keuangan::query()
                ->selectRaw('SUM(uang_masuk) - SUM(uang_keluar) as total')
                ->value('total') ?? 0;
            
            $transaksiTerakhir = Keuangan::query()->latest('id')->first();
            $saldoSebelumnya = $saldoTerakhir;
            
            if ($transaksiTerakhir) {
                $saldoSebelumnya = $saldoTerakhir - $transaksiTerakhir->uang_masuk + $transaksiTerakhir->uang_keluar;
            }
            
            // Data Absensi dengan perbandingan 2 pertemuan terakhir
            $recentDates = Absensi::select('tanggal')
                ->distinct()
                ->orderBy('tanggal', 'desc')
                ->limit(2)
                ->pluck('tanggal');
                
            $siswaBerangkatMingguIni = $recentDates->isNotEmpty() ? 
                Absensi::where('tanggal', $recentDates->first())
                    ->distinct()
                    ->count('id_siswa') : 0;
                    
            $siswaBerangkatMingguLalu = $recentDates->count() > 1 ? 
                Absensi::where('tanggal', $recentDates->last())
                    ->distinct()
                    ->count('id_siswa') : 0;

            $responseData = [
                'total_siswa' => $totalSiswa,
                'siswa_aktif' => $siswaAktif,
                'saldo' => [
                    'terakhir' => $saldoTerakhir,
                    'sebelumnya' => $saldoSebelumnya,
                ],
                'siswa_berangkat' => [
                    'minggu_ini' => $siswaBerangkatMingguIni,
                    'minggu_lalu' => $siswaBerangkatMingguLalu,
                ],
            ];

            Log::info('Dashboard summary returned successfully', [
                'user_id' => $user->id,
                'data_summary' => $responseData
            ]);

            return response()->json($responseData);

        } catch (\Exception $e) {
            Log::error('Error generating dashboard summary', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error generating dashboard summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}