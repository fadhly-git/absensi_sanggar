<?php

namespace App\Http\Controllers;

use App\Exports\SiswaExport;
use App\Http\Requests\SiswaRequest;
use App\Http\Resources\SiswaResource;
use App\Imports\SiswaImport;
use App\Models\Siswa;
use App\Models\User;
use Carbon\Carbon;
use Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class SiswaController extends Controller
{

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
            $query = Siswa::query();

            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('nama', 'like', "%{$searchTerm}%")
                        ->orWhere('alamat', 'like', "%{$searchTerm}%");
                });
            }

            if ($request->filled('status') && $request->status !== 'all') {
                $status = $request->status === '1' ? true : false;
                $query->where('status', $status);
            }

            $sortBy = $request->get('sortBy', 'nama');
            $sortOrder = $request->get('sortOrder', 'asc');
            $allowedSortFields = ['nama', 'alamat', 'created_at', 'status'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            }

            $perPage = min($request->get('per_page', 10), 100);
            $siswa = $query->paginate($perPage);

            return SiswaResource::collection($siswa);

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

    /**
     * Store new siswa
     */
    public function store(SiswaRequest $request)
    {
        try {
            DB::beginTransaction();
            $validated = $request->validated();

            // Set default tanggal_terdaftar to now 
            $tanggal_terdaftar = Carbon::now()->toDateString();
            $tahun_masuk = Carbon::now()->year;

            // generate nis untuk tahun masuk
            $count = Siswa::withTrashed()->whereYear('tanggal_terdaftar', $tahun_masuk)->count();
            $inisial = strtolower(env('INITIAL_CODE', 'stnlb'));
            $nis = $tahun_masuk . $inisial . sprintf('%04d', $count + 1);

            // buat user baru
            $user = User::create([
                'name' => ucwords(strtolower($validated['nama'])),
                'email' => $nis . '@ngelaras.my.id',
                'password' => Hash::make($nis), // Set password sebagai NIS
                'role' => 'siswa',
                'nis' => $nis,
            ]);

            DB::commit();

            // buat siswa baru dan relasikan dengan user
            $siswa = Siswa::create([
                'nama' => ucwords(strtolower($validated['nama'])),
                'alamat' => $validated['alamat'],
                'status' => $validated['status'],
                'tanggal_terdaftar' => $tanggal_terdaftar,
                'user_id' => $user->id,
            ]);

            DB::commit();

            Log::info('New siswa created', [
                'user_id' => auth()->id(),
                'siswa_id' => $siswa->id,
                'siswa_data' => $siswa->toArray()
            ]);

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
            DB::beginTransaction();
            $oldData = $siswa->toArray();
            $siswa->update($request->validated());
            DB::commit();

            Log::info('Siswa updated', [
                'user_id' => auth()->id(),
                'siswa_id' => $id,
                'old_data' => $oldData,
                'new_data' => $siswa->fresh()->toArray()
            ]);

            return response()->json([
                'message' => 'Siswa berhasil diperbarui',
                'data' => new SiswaResource($siswa->fresh())
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
            DB::beginTransaction();
            $siswa->delete();
            DB::commit();

            Log::info('Siswa soft deleted', [
                'user_id' => auth()->id(),
                'siswa_id' => $id,
                'siswa_data' => $siswa->toArray()
            ]);

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
            DB::beginTransaction();
            $siswa->restore();
            DB::commit();

            Log::info('Siswa restored', [
                'user_id' => auth()->id(),
                'siswa_id' => $id
            ]);

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

        try {
            DB::beginTransaction();

            $ids = $request->ids;
            $action = $request->action;
            $affectedCount = 0;

            switch ($action) {
                case 'activate':
                    $affectedCount = Siswa::whereIn('id', $ids)->update(['status' => true]);
                    $message = "{$affectedCount} siswa berhasil diaktifkan";
                    break;

                case 'deactivate':
                    $affectedCount = Siswa::whereIn('id', $ids)->update(['status' => false]);
                    $message = "{$affectedCount} siswa berhasil dinonaktifkan";
                    break;

                case 'delete':
                    $affectedCount = Siswa::whereIn('id', $ids)->delete(); // Soft delete
                    $message = "{$affectedCount} siswa berhasil dihapus";
                    break;

                case 'restore':
                    $affectedCount = Siswa::withTrashed()->whereIn('id', $ids)->restore();
                    $message = "{$affectedCount} siswa berhasil dipulihkan";
                    break;
            }

            DB::commit();

            // Log::info('Bulk action performed on siswa', [
            //     'user_id' => auth()->id(),
            //     'action' => $action,
            //     'ids' => $ids,
            //     'affected_count' => $affectedCount
            // ]);

            return response()->json([
                'message' => $message,
                'affected_count' => $affectedCount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            // Log::error('Error performing bulk action', [
            //     'user_id' => auth()->id(),
            //     'action' => $request->action,
            //     'ids' => $request->ids,
            //     'error' => $e->getMessage()
            // ]);

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
            $count = Siswa::count();

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
            $count = Siswa::where('status', true)->count();

            return response()->json([
                'count' => $count
            ]);

        } catch (\Exception $e) {
            // Log::error('Error getting active siswa count', [
            //     'user_id' => auth()->id(),
            //     'error' => $e->getMessage()
            // ]);

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
            $query = Siswa::onlyTrashed();

            // Apply search filter
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('nama', 'like', "%{$searchTerm}%")
                        ->orWhere('alamat', 'like', "%{$searchTerm}%");
                });
            }

            $perPage = min($request->get('per_page', 10), 100);
            $siswa = $query->orderBy('deleted_at', 'desc')->paginate($perPage);

            return response()->json($siswa);

        } catch (\Exception $e) {
            // Log::error('Error getting trashed siswa', [
            //     'user_id' => auth()->id(),
            //     'error' => $e->getMessage()
            // ]);

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

            // Log::info('Siswa force deleted', [
            //     'user_id' => auth()->id(),
            //     'siswa_id' => $id
            // ]);

            return response()->json([
                'message' => 'Siswa berhasil dihapus permanen'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            // Log::error('Error force deleting siswa', [
            //     'user_id' => auth()->id(),
            //     'siswa_id' => $id,
            //     'error' => $e->getMessage()
            // ]);

            return response()->json([
                'message' => 'Gagal menghapus permanen siswa',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}