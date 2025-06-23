<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Keuangan;
use App\Exports\FinancialExport;
use Maatwebsite\Excel\Facades\Excel;

class KeuanganCon extends Controller
{
    public function exportFinancialReport(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|string',
            'params' => 'required|in:year,month',
        ]);

        $filename = 'laporan_keuangan_';
        $filename .= ($validated['params'] === 'year')
            ? 'tahun_' . $validated['date']
            : 'bulan_' . str_replace('-', '_', $validated['date']);
        $filename .= '.xlsx';

        return Excel::download(
            new FinancialExport($validated['date'], $validated['params']),
            $filename
        );
    }

    public function getUangByDate(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'type' => 'required|in:masuk,keluar', // Pastikan type adalah "masuk" atau "keluar"
            'date' => 'required|string',          // Pastikan date adalah input string
            'params' => 'required|string', // Pastikan params adalah "year" atau "month"
        ]);

        // Tentukan kolom yang akan digunakan berdasarkan type
        if ($validated['type'] === 'masuk') {
            $columnAmount = 'uang_masuk';
            $columnDescription = 'keterangan_masuk';
        } else { // type === 'keluar'
            $columnAmount = 'uang_keluar';
            $columnDescription = 'keterangan_keluar';
        }

        // Ambil data berdasarkan parameter
        $data = [];
        if($validated['type'] === 'masuk'){
            $data = Keuangan::getUangMasukByDate($validated['date'], $validated['params']);
        } elseif ($validated['type'] === 'keluar') {
            $data = Keuangan::getUangKeluarByDate($validated['date'], $validated['params']);
        }

        // Kembalikan data dalam bentuk JSON
        return response()->json($data);
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

    public function update(Request $request, $id)
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
                // Cari data berdasarkan ID dan perbarui datanya
                $existingData = DB::table('keuangans')->where('id', $id)->first();

                if (!$existingData) {
                    return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
                }

                // Periksa apakah amount berubah
                $updateSaldo = false;
                if ($validated['type'] === 'masuk' && $existingData->uang_masuk != $item['amount']) {
                    $updateSaldo = true;
                } else if ($validated['type'] === 'keluar' && $existingData->uang_keluar != $item['amount']) {
                    $updateSaldo = true;
                }

                // Perbarui saldo terakhir jika amount berubah
                if ($updateSaldo) {
                    $saldoTerakhir = $this->calculateSaldoTerakhir($validated['type'], $item['amount']);
                } else {
                    $saldoTerakhir = $existingData->saldo_terakhir;
                }

                // Update data sesuai jenis transaksi
                if ($validated['type'] === 'masuk') {
                    DB::table('keuangans')->where('id', $id)->update([
                        'saldo_terakhir' => $saldoTerakhir,
                        'uang_masuk' => $item['amount'],
                        'keterangan_masuk' => $item['keterangan'],
                        'tanggal' => $validated['tanggal'],
                        'updated_at' => now(),
                    ]);
                } else if ($validated['type'] === 'keluar') {
                    DB::table('keuangans')->where('id', $id)->update([
                        'saldo_terakhir' => $saldoTerakhir,
                        'uang_keluar' => $item['amount'],
                        'keterangan_keluar' => $item['keterangan'],
                        'tanggal' => $validated['tanggal'],
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Data berhasil diperbarui']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function delete($id)
    {
        // Ambil data keuangan berdasarkan ID
        $existingData = DB::table('keuangans')->where('id', $id)->first();

        if (!$existingData) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        // Kurangi saldo_terakhir dengan data uang_keluar atau uang_masuk
        if ($existingData->uang_masuk > 0) {
            $newSaldo = $existingData->saldo_terakhir - $existingData->uang_masuk;
        } else if ($existingData->uang_keluar > 0) {
            $newSaldo = $existingData->saldo_terakhir + $existingData->uang_keluar;
        }

        // Update data keuangan menjadi terhapus dan perbarui saldo_terakhir
        DB::table('keuangans')->where('id', $id)->update([
            'deleted' => 1,
            'saldo_terakhir' => $newSaldo,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil dihapus'
        ]);
    }


    public function getSaldo()
    {
        // Hitung saldo terakhir (seluruh transaksi yang tidak dihapus)
        $saldoTerakhir = DB::table('keuangans')
            ->where('deleted', 0)
            ->selectRaw('SUM(CAST(uang_masuk AS DECIMAL(10, 2))) - SUM(CAST(uang_keluar AS DECIMAL(10, 2))) AS saldo_terakhir')
            ->value('saldo_terakhir');

        // Hitung saldo sebelumnya (saldo terakhir dikurangi transaksi terakhir)
        $lastTransaction = DB::table('keuangans')
            ->where('deleted', 0)
            ->orderBy('tanggal', 'DESC')
            ->orderBy('id', 'DESC')
            ->first(['uang_masuk', 'uang_keluar']);

        $saldoSebelumnya = $saldoTerakhir;
        if ($lastTransaction) {
            $saldoSebelumnya = $saldoTerakhir
                - ($lastTransaction->uang_masuk ?? 0)
                + ($lastTransaction->uang_keluar ?? 0);
        }

        // Kembalikan hasil sebagai JSON
        return response()->json([
            'saldo_terakhir' => $saldoTerakhir,
            'saldo_sebelumnya' => $saldoSebelumnya,
        ]);
    }

    private function calculateSaldoTerakhir($type, $amount)
    {
        // Ambil saldo terakhir dari database
        $lastTransaction = DB::table('keuangans')->orderBy('id', 'desc')->first();

        if ($lastTransaction) {
            $saldoTerakhir =  $lastTransaction->saldo_terakhir;
        } else {
            $saldoTerakhir = 0; // Jika belum ada transaksi, saldo awal adalah 0
        }

        // Update saldo terakhir berdasarkan jenis transaksi
        if ($type === 'masuk') {
            $saldoTerakhir += $amount;
        } else if ($type === 'keluar') {
            $saldoTerakhir -= $amount;
        }

        return $saldoTerakhir; // Format saldo dengan pemisah ribuan
    }
}
