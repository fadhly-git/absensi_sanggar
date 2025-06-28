<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\Keuangan;
use App\Models\Absensi;

class DashboardController extends Controller
{
    public function getSummary()
    {
        // Data Siswa
        $totalSiswa = Siswa::count();
        $siswaAktif = Siswa::where('status', 1)->count();

        // Data Saldo dengan perbandingan
        $saldoTerakhir = Keuangan::query()->selectRaw('SUM(uang_masuk) - SUM(uang_keluar) as total')->value('total') ?? 0;
        $transaksiTerakhir = Keuangan::query()->latest('id')->first();
        $saldoSebelumnya = $saldoTerakhir;
        if ($transaksiTerakhir) {
            $saldoSebelumnya = $saldoTerakhir - $transaksiTerakhir->uang_masuk + $transaksiTerakhir->uang_keluar;
        }
        
        // Data Absensi dengan perbandingan 2 pertemuan terakhir
        $recentDates = Absensi::select('tanggal')->distinct()->orderBy('tanggal', 'desc')->limit(2)->pluck('tanggal');
        $siswaBerangkatMingguIni = $recentDates->isNotEmpty() ? Absensi::where('tanggal', $recentDates->first())->distinct()->count('id_siswa') : 0;
        $siswaBerangkatMingguLalu = $recentDates->count() > 1 ? Absensi::where('tanggal', $recentDates->last())->distinct()->count('id_siswa') : 0;

        return response()->json([
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
        ]);
    }
}