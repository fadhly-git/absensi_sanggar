<?php

namespace App\Http\Controllers;

use App\Http\Requests\SiswaRequest;
use App\Http\Resources\SiswaResource;
use App\Imports\SiswaImport;
use App\Models\Siswa;
use App\Models\User;
use App\Services\SiswaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class SiswaController extends Controller
{
    /**
     * @var SiswaService
     */
    protected $siswaService;

    public function __construct(SiswaService $siswaService)
    {
        $this->siswaService = $siswaService;
    }

    // Helper untuk error response & logging
    private function errorResponse($message, $e, $context = [], $status = 500)
    {
        Log::error($message, array_merge([
            'user_id' => auth()->id(),
            'error' => $e->getMessage()
        ], $context));
        return response()->json([
            'message' => $message,
            'error' => $e->getMessage()
        ], $status);
    }

    /**
     * Export semua data siswa ke Excel
     */
    public function export(Request $request)
    {
        try {
            $filters = $request->only(['search', 'status', 'sortBy', 'sortOrder']);
            $filename = 'data-siswa-' . date('Y-m-d-H-i-s') . '.csv';
            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\SiswaExport($filters),
                $filename,
                \Maatwebsite\Excel\Excel::CSV, // Ganti ke CSV
                ['Content-Type' => 'text/csv']
            );
        } catch (\Exception $e) {
            \Log::error('Error exporting siswa data', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Gagal mengekspor data siswa',
                'error' => $e->getMessage()
            ], 500);
        }

    }

    /**
     * Import data siswa dari Excel
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls,csv|max:2048'
        ], [
            'file.required' => 'File harus dipilih',
            'file.mimes' => 'File harus berformat Excel atau CSV',
            'file.max' => 'Ukuran file maksimal 2MB'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'File tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $import = new SiswaImport();
            Excel::import($import, $request->file('file'));

            DB::commit();

            // Log::info('Siswa data imported', [
            //     'user_id' => auth()->id(),
            //     'success_count' => $import->getSuccessCount(),
            //     'failed_count' => $import->getFailedCount()
            // ]);

            return response()->json([
                'message' => 'Data berhasil diimpor',
                'success' => $import->getSuccessCount(),
                'failed' => $import->getFailedCount(),
                'errors' => $import->getErrors()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error importing siswa data', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Gagal mengimpor data siswa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download template Excel untuk import
     */
    public function downloadTemplate()
    {
        try {
            $filename = 'template-siswa.xlsx';
            $templateData = [
                ['Nama Siswa', 'Alamat Lengkap', 'Status (1=Aktif, 0=Non-Aktif)'],
                ['John Doe', 'Jl. Contoh No. 123', '1'],
                ['Jane Smith', 'Jl. Sampel No. 456', '1']
            ];

            return \Maatwebsite\Excel\Facades\Excel::download(
                new class ($templateData) implements \Maatwebsite\Excel\Concerns\FromArray, \Maatwebsite\Excel\Concerns\WithHeadings {
                private $data;
                public function __construct($data)
                {
                    $this->data = $data;
                }
                public function array(): array
                {
                    return array_slice($this->data, 1);
                }
                public function headings(): array
                {
                    return $this->data[0];
                }
                },
                $filename,
                \Maatwebsite\Excel\Excel::CSV
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mendownload template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get paginated siswa with filters
     */
    public function index(Request $request)
    {
        try {
            $results = $this->siswaService->getPaginated($request->all());
            return response()->json($results);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil data siswa', $e);
        }
    }

    /**
     * Get single siswa by ID
     */
    public function show($id)
    {
        try {
            $siswa = Siswa::findOrFail($id);
            return new SiswaResource($siswa);
        } catch (\Exception $e) {
            return $this->errorResponse('Siswa tidak ditemukan', $e, ['siswa_id' => $id], 404);
        }
    }

    public function getById($id)
    {
        try {
            $user = User::findOrFail($id);
            $siswa = Siswa::with(['user', 'absensis'])->where('user_id', $user->id)->firstOrFail();
            return new SiswaResource($siswa);
        } catch (\Exception $e) {
            return $this->errorResponse('Siswa tidak ditemukan', $e, ['siswa_id' => $id], 404);
        }
    }

    /**
     * Store new siswa
     */
    public function store(SiswaRequest $request)
    {
        try {
            $siswa = $this->siswaService->store($request->validated());
            return response()->json([
                'message' => 'Siswa berhasil ditambahkan',
                'data' => new SiswaResource($siswa)
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Gagal menambahkan siswa', $e, ['request_data' => $request->all()]);
        }
    }

    /**
     * Update existing siswa
     */
    public function update(SiswaRequest $request, $id)
    {
        try {
            $siswa = Siswa::findOrFail($id);
            $updated = $this->siswaService->update($siswa, $request->validated());

            return response()->json([
                'message' => 'Siswa berhasil diperbarui',
                'data' => new SiswaResource($updated)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Gagal memperbarui siswa', $e, ['siswa_id' => $id, 'request_data' => $request->all()]);
        }
    }

    /**
     * Delete siswa (soft delete)
     */
    public function delete($id)
    {
        try {
            $siswa = Siswa::findOrFail($id);
            $this->siswaService->delete($siswa);
            return response()->json(['message' => 'Siswa berhasil dihapus']);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Gagal menghapus siswa', $e, ['siswa_id' => $id]);
        }
    }

    /**
     * Restore soft deleted siswa
     */
    public function restore($id)
    {
        try {
            $siswa = Siswa::withTrashed()->findOrFail($id);
            if (!$siswa->trashed()) {
                return response()->json(['message' => 'Siswa tidak dalam status terhapus'], 400);
            }
            $this->siswaService->restore($siswa);

            return response()->json([
                'message' => 'Siswa berhasil dipulihkan',
                'data' => new SiswaResource($siswa->fresh())
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Gagal memulihkan siswa', $e, ['siswa_id' => $id]);
        }
    }

    /**
     * Bulk actions for multiple siswa
     */
    public function bulkAction(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|string|in:activate,deactivate,delete,restore',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Data tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }
        DB::beginTransaction();
        try {
            $affectedCount = $this->siswaService->bulkAction(
                $request->action,
                $request->ids
            );

            DB::commit();

            return response()->json([
                'message' => "{$affectedCount} siswa berhasil di {$request->action}",
                'affected_count' => $affectedCount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Gagal melakukan operasi bulk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get count of all siswa (excluding soft deleted)
     */
    public function getCountSiswa()
    {
        try {
            $count = $this->siswaService->getCount();

            return response()->json([
                'count' => $count
            ]);

        } catch (\Exception $e) {
            // Log::error('Error getting siswa count', [
            //     'user_id' => auth()->id(),
            //     'error' => $e->getMessage()
            // ]);

            return response()->json([
                'message' => 'Gagal mengambil jumlah siswa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get count of active siswa
     */
    public function getCountSiswaAktif()
    {
        try {
            $count = $this->siswaService->getCountAktif();

            return response()->json([
                'count' => $count
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'message' => 'Gagal mengambil jumlah siswa aktif',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get deleted siswa (soft deleted)
     */
    public function getTrashed(Request $request)
    {
        try {
            $result = $this->siswaService->getTrashed($request->all());
            return response()->json($result);

        } catch (\Exception $e) {

            return response()->json([
                'message' => 'Gagal mengambil data siswa yang dihapus',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Force delete siswa (permanent delete)
     */
    public function forceDelete($id)
    {
        try {
            $siswa = Siswa::withTrashed()->findOrFail($id);

            DB::beginTransaction();

            // Check if siswa has related absensi records
            $hasAbsensi = $siswa->absensis()->count() > 0;

            if ($hasAbsensi) {
                return response()->json([
                    'message' => 'Tidak dapat menghapus permanen. Siswa memiliki riwayat absensi.'
                ], 400);
            }

            $siswa->forceDelete();

            DB::commit();
            return response()->json([
                'message' => 'Siswa berhasil dihapus permanen'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menghapus permanen siswa',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}