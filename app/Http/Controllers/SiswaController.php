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
            return $this->errorResponse('Gagal mengekspor data siswa', $e);
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
            return $this->errorResponse('File tidak valid', null, ['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $import = new SiswaImport();
            Excel::import($import, $request->file('file'));

            // Generate QR codes untuk siswa yang baru diimport
            $import->generateQrCodes();

            DB::commit();

            Log::info('Siswa data imported with QR codes', [
                'user_id' => auth()->id(),
                'success_count' => $import->getSuccessCount(),
                'failed_count' => $import->getFailedCount()
            ]);

            return $this->successResponse([
                'success' => $import->getSuccessCount(),
                'failed' => $import->getFailedCount(),
                'errors' => $import->getErrors()
            ], 'Data berhasil diimpor dan QR code telah dibuat');

        } catch (\Exception $e) {
            DB::rollBack();

            return $this->errorResponse('Gagal mengimpor data siswa', $e);
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
            return $this->errorResponse('Gagal mendownload template', $e);
        }
    }

    /**
     * Get paginated siswa with filters
     */
    public function index(Request $request)
    {
        try {
            $results = $this->siswaService->getPaginated($request->all());
            return $this->successResponse($results);
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
            return $this->successResponse(new SiswaResource($siswa), 'Siswa berhasil ditambahkan', 201);
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

            return $this->successResponse(new SiswaResource($updated), 'Siswa berhasil diperbarui');

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
            return $this->successResponse(null, 'Siswa berhasil dihapus');

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
                return $this->errorResponse('Siswa tidak dalam status terhapus', null, [], 400);
            }
            $this->siswaService->restore($siswa);

            return $this->successResponse(new SiswaResource($siswa->fresh()), 'Siswa berhasil dipulihkan');

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
            return $this->errorResponse('Data tidak valid', null, ['errors' => $validator->errors()], 422);
        }
        DB::beginTransaction();
        try {
            $affectedCount = $this->siswaService->bulkAction(
                $request->action,
                $request->ids
            );

            DB::commit();

            return $this->successResponse(['affected_count' => $affectedCount], "{$affectedCount} siswa berhasil di {$request->action}");

        } catch (\Exception $e) {
            DB::rollBack();

            return $this->errorResponse('Gagal melakukan operasi bulk', $e);
        }
    }

    /**
     * Get count of all siswa (excluding soft deleted)
     */
    public function getCountSiswa()
    {
        try {
            $count = $this->siswaService->getCount();

            return $this->successResponse(['count' => $count]);

        } catch (\Exception $e) {
            // Log::error('Error getting siswa count', [
            //     'user_id' => auth()->id(),
            //     'error' => $e->getMessage()
            // ]);

            return $this->errorResponse('Gagal mengambil jumlah siswa', $e);
        }
    }

    /**
     * Get count of active siswa
     */
    public function getCountSiswaAktif()
    {
        try {
            $count = $this->siswaService->getCountAktif();

            return $this->successResponse(['count' => $count]);

        } catch (\Exception $e) {

            return $this->errorResponse('Gagal mengambil jumlah siswa aktif', $e);
        }
    }

    /**
     * Get deleted siswa (soft deleted)
     */
    public function getTrashed(Request $request)
    {
        try {
            $result = $this->siswaService->getTrashed($request->all());
            return $this->successResponse($result);

        } catch (\Exception $e) {

            return $this->errorResponse('Gagal mengambil data siswa yang dihapus', $e);
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
                return $this->errorResponse('Tidak dapat menghapus permanen. Siswa memiliki riwayat absensi.', null, [], 400);
            }

            $siswa->forceDelete();

            DB::commit();
            return $this->successResponse(null, 'Siswa berhasil dihapus permanen');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Gagal menghapus permanen siswa', $e);
        }
    }
}
