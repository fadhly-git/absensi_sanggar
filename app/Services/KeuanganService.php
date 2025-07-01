<?php

namespace App\Services;

use App\Models\Keuangan;
use Illuminate\Support\Facades\DB;

class KeuanganService
{
    public function getTransactions(string $type, string $date, string $params): array
    {
        $query = Keuangan::type($type)->period($date, $params);

        // Use model accessors instead of manual select
        return $query->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'tanggal' => $item->tanggal,
                    'keterangan' => $item->keterangan, // Uses accessor
                    'jumlah' => floatval($item->jumlah), // Uses accessor
                ];
            })
            ->toArray();

    }

    public function createTransaction(string $type, string $tanggal, float $amount, string $keterangan): void
    {

        $data = [
            'tanggal' => $tanggal,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        if ($type === 'masuk') {
            $data['uang_masuk'] = $amount;
            $data['keterangan_masuk'] = $keterangan;
            $data['uang_keluar'] = 0;
            $data['keterangan_keluar'] = '';
        } else {
            $data['uang_keluar'] = $amount;
            $data['keterangan_keluar'] = $keterangan;
            $data['uang_masuk'] = 0;
            $data['keterangan_masuk'] = '';
        }

        Keuangan::create($data);
    }

    public function updateTransaction(int $id, string $type, string $tanggal, float $amount, string $keterangan): void
    {
        $transaction = Keuangan::findOrFail($id);

        // Recalculate saldo (remove old transaction effect, add new)
        $oldSaldo = $this->calculateSaldoWithoutTransaction($transaction);
        $newSaldo = $type === 'masuk' ? $oldSaldo + $amount : $oldSaldo - $amount;

        $data = [
            'tanggal' => $tanggal,
            'updated_at' => now(),
        ];

        if ($type === 'masuk') {
            $data['uang_masuk'] = $amount;
            $data['keterangan_masuk'] = $keterangan;
            $data['uang_keluar'] = 0;
            $data['keterangan_keluar'] = '';
        } else {
            $data['uang_keluar'] = $amount;
            $data['keterangan_keluar'] = $keterangan;
            $data['uang_masuk'] = 0;
            $data['keterangan_masuk'] = '';
        }

        $transaction->update($data);
    }

    public function deleteTransaction(int $id): bool
    {
        $transaction = Keuangan::find($id);
        if (!$transaction) {
            return false;
        }

        $transaction->delete();
        return true;
    }

    public function getSaldo(): array
    {
        $saldoTerakhir = Keuangan::selectRaw('COALESCE(SUM(CAST(uang_masuk AS DECIMAL(15, 2))) - SUM(CAST(uang_keluar AS DECIMAL(15, 2))), 0) AS saldo')
            ->value('saldo') ?? 0;

        $lastTransaction = Keuangan::orderByDesc('tanggal')
            ->orderByDesc('id')
            ->first(['uang_masuk', 'uang_keluar']);

        $saldoSebelumnya = $saldoTerakhir;
        if ($lastTransaction) {
            $saldoSebelumnya = $saldoTerakhir
                - ($lastTransaction->uang_masuk ?? 0)
                + ($lastTransaction->uang_keluar ?? 0);
        }

        return [
            'saldo_terakhir' => (float) $saldoTerakhir,
            'saldo_sebelumnya' => (float) $saldoSebelumnya,
        ];
    }


    private function calculateSaldoWithoutTransaction($transaction): float
    {
        $saldoBeforeTransaction = Keuangan::where('id', '<', $transaction->id)
            ->selectRaw('COALESCE(SUM(CAST(uang_masuk AS DECIMAL(15, 2))) - SUM(CAST(uang_keluar AS DECIMAL(15, 2))), 0) AS saldo')
            ->value('saldo') ?? 0;

        return (float) $saldoBeforeTransaction;
    }
}