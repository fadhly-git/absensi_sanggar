<?php

namespace App\Http\Controllers;

use App\Services\KeuanganService;
use App\Http\Requests\GetTransactionRequest;
use App\Http\Requests\TransactionRequest;
use App\Http\Resources\ApiResponse;
use App\Exports\FinancialExport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class KeuanganController extends Controller
{
    public function __construct(
        private KeuanganService $keuanganService
    ) {
    }

    public function getTransactions(GetTransactionRequest $request): JsonResponse
    {
        try {
            $data = $this->keuanganService->getTransactions(
                $request->type,
                $request->date,
                $request->params
            );

            // Pastikan data selalu array
            $data = is_array($data) ? $data : [];

            return ApiResponse::success($data);
        } catch (\Exception $e) {
            \Log::error('KeuanganController@getTransactions error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return ApiResponse::error('Gagal mengambil data: ' . $e->getMessage());
        }
    }

    public function getSaldo(): JsonResponse
    {
        try {
            $saldo = $this->keuanganService->getSaldo();

            // Pastikan struktur data konsisten
            $saldo = [
                'saldo_terakhir' => (float) ($saldo['saldo_terakhir'] ?? 0),
                'saldo_sebelumnya' => (float) ($saldo['saldo_sebelumnya'] ?? 0),
            ];

            return ApiResponse::success($saldo);
        } catch (\Exception $e) {
            \Log::error('KeuanganController@getSaldo error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return ApiResponse::error('Gagal mengambil data saldo: ' . $e->getMessage());
        }
    }

    public function store(TransactionRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            foreach ($request->data as $item) {
                $this->keuanganService->createTransaction(
                    $request->type,
                    $request->tanggal,
                    $item['amount'],
                    $item['keterangan']
                );
            }

            DB::commit();
            return ApiResponse::success(null, 'Data berhasil disimpan');
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal menyimpan data: ' . $e->getMessage());
        }
    }

    public function update(TransactionRequest $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $item = $request->data[0]; // Single item update

            $this->keuanganService->updateTransaction(
                $id,
                $request->type,
                $request->tanggal,
                $item['amount'],
                $item['keterangan']
            );

            DB::commit();
            return ApiResponse::success(null, 'Data berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal memperbarui data: ' . $e->getMessage());
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->keuanganService->deleteTransaction($id);

            if (!$deleted) {
                return ApiResponse::error('Data tidak ditemukan', 404);
            }

            return ApiResponse::success(null, 'Data berhasil dihapus');
        } catch (\Exception $e) {
            return ApiResponse::error('Gagal menghapus data: ' . $e->getMessage());
        }
    }


    public function exportFinancialReport(Request $request)
    {
        $request->validate([
            'date' => 'required|string',
            'params' => 'required|in:year,month',
        ]);

        $filename = 'laporan_keuangan_' .
            ($request->params === 'year'
                ? 'tahun_' . $request->date
                : 'bulan_' . str_replace('-', '_', $request->date)
            ) . '.xlsx';

        return Excel::download(
            new FinancialExport($request->date, $request->params),
            $filename
        );
    }
}