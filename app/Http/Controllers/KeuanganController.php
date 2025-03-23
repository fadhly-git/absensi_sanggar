<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KeuanganController extends Controller
{
    public function index()
    {
        
        return response()->json([
            'status' => 'success',
            'message' => 'Data berhasil diambil'
        ]);
    }

    public function store(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'type' => 'required|in:masuk,keluar', // Pastikan type adalah "masuk" atau "keluar"
            'tanggal' => 'required|date',           // Pastikan tanggal adalah format tanggal
            'data' => 'required|array',          // Data harus berupa array
            'data.*.amount' => 'required|numeric|min:0', // Pastikan amount adalah angka positif
            'data.*.keterangan' => 'required|string',   // Pastikan keterangan adalah string
        ]);

        DB::beginTransaction();
        try {
            foreach ($validated['data'] as $item) {
                // Simpan data ke database sesuai jenis transaksi
                if ($validated['type'] === 'masuk') {
                    DB::table('keuangans')->insert([
                        'saldo_terakhir' => $this->calculateSaldoTerakhir($validated['type'], $item['amount']),
                        'uang_masuk' => $item['amount'],
                        'keterangan_masuk' => $item['keterangan'],
                        'uang_keluar' => '0', // Set uang keluar ke 0 karena ini transaksi masuk
                        'keterangan_keluar' => '', // Kosongkan keterangan keluar
                        'tanggal' => $validated['tanggal'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else if ($validated['type'] === 'keluar') {
                    DB::table('keuangans')->insert([
                        'saldo_terakhir' => $this->calculateSaldoTerakhir($validated['type'], $item['amount']),
                        'uang_masuk' => '0', // Set uang masuk ke 0 karena ini transaksi keluar
                        'keterangan_masuk' => '', // Kosongkan keterangan masuk
                        'uang_keluar' => $item['amount'],
                        'keterangan_keluar' => $item['keterangan'],
                        'tanggal' => $validated['tanggal'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Data berhasil disimpan']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    // Fungsi untuk menghitung saldo terakhir
    private function calculateSaldoTerakhir($type, $amount)
    {
        // Ambil saldo terakhir dari database
        $lastTransaction = DB::table('keuangans')->orderBy('id', 'desc')->first();

        if ($lastTransaction) {
            $saldoTerakhir = floatval(str_replace(',', '', $lastTransaction->saldo_terakhir));
        } else {
            $saldoTerakhir = 0; // Jika belum ada transaksi, saldo awal adalah 0
        }

        // Update saldo terakhir berdasarkan jenis transaksi
        if ($type === 'masuk') {
            $saldoTerakhir += floatval($amount);
        } else if ($type === 'keluar') {
            $saldoTerakhir -= floatval($amount);
        }

        return number_format($saldoTerakhir, 0, ',', '.'); // Format saldo dengan pemisah ribuan
    }

    public function update(Request $request, $id)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Data berhasil diupdate'
        ]);
    }

    public function delete($id)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Data berhasil dihapus'
        ]);
    }
}
