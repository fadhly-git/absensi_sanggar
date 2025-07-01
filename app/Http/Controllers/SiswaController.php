<?php

namespace App\Http\Controllers;

use App\Exports\SiswaExport;
use App\Imports\SiswaImport;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class SiswaController extends Controller
{

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

            // Apply search filter
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('nama', 'like', "%{$searchTerm}%")
                        ->orWhere('alamat', 'like', "%{$searchTerm}%");
                });
            }

            // Apply status filter
            if ($request->filled('status') && $request->status !== 'all') {
                $status = $request->status === '1' ? true : false;
                $query->where('status', $status);
            }

            // Apply sorting
            $sortBy = $request->get('sortBy', 'nama');
            $sortOrder = $request->get('sortOrder', 'asc');

            $allowedSortFields = ['nama', 'alamat', 'created_at', 'status'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            }

            // Get paginated results
            $perPage = min($request->get('per_page', 10), 100);
            $siswa = $query->paginate($perPage);

            // Add additional data to each siswa
            $siswa->getCollection()->transform(function ($item) {
                $item->total_absensi = $item->total_absensi;
                $item->absensi_bulan_ini = $item->absensi_bulan_ini;
                return $item;
            });

            // Log::info('Siswa data fetched', [
            //     'user_id' => auth()->id(),
            //     'filters' => $request->only(['search', 'status', 'sortBy', 'sortOrder']),
            //     'total' => $siswa->total(),
            //     'per_page' => $perPage
            // ]);

            return response()->json($siswa);

        } catch (\Exception $e) {
            // Log::error('Error fetching siswa data', [
            //     'user_id' => auth()->id(),
            //     'error' => $e->getMessage(),
            //     'trace' => $e->getTraceAsString()
            // ]);

            return response()->json([
                'message' => 'Gagal mengambil data siswa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single siswa by ID
     */
    public function show($id)
    {
        try {
            $siswa = Siswa::with([
                'absensis' => function ($query) {
                    $query->latest('tanggal')->take(10);
                }
            ])->findOrFail($id);

            // Add calculated fields
            $siswa->total_absensi = $siswa->total_absensi;
            $siswa->absensi_bulan_ini = $siswa->absensi_bulan_ini;

            Log::info('Siswa detail viewed', [
                'user_id' => auth()->id(),
                'siswa_id' => $id
            ]);

            return response()->json($siswa);

        } catch (\Exception $e) {
            // Log::error('Error fetching siswa detail', [
            //     'user_id' => auth()->id(),
            //     'siswa_id' => $id,
            //     'error' => $e->getMessage()
            // ]);

            return response()->json([
                'message' => 'Siswa tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Store new siswa
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|min:2|max:255',
            'alamat' => 'required|string|min:5|max:1000',
            'status' => 'required|boolean'
        ], [
            'nama.required' => 'Nama harus diisi',
            'nama.min' => 'Nama minimal 2 karakter',
            'alamat.required' => 'Alamat harus diisi',
            'alamat.min' => 'Alamat minimal 5 karakter',
            'status.required' => 'Status harus dipilih'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Data tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $siswa = Siswa::create([
                'nama' => $request->nama,
                'alamat' => $request->alamat,
                'status' => $request->status
            ]);

            DB::commit();

            // Log::info('New siswa created', [
            //     'user_id' => auth()->id(),
            //     'siswa_id' => $siswa->id,
            //     'siswa_data' => $siswa->toArray()
            // ]);

            return response()->json([
                'message' => 'Siswa berhasil ditambahkan',
                'data' => $siswa
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            // Log::error('Error creating siswa', [
            //     'user_id' => auth()->id(),
            //     'request_data' => $request->all(),
            //     'error' => $e->getMessage()
            // ]);

            return response()->json([
                'message' => 'Gagal menambahkan siswa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update existing siswa
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|required|string|min:2|max:255',
            'alamat' => 'sometimes|required|string|min:5|max:1000',
            'status' => 'sometimes|required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Data tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $siswa = Siswa::findOrFail($id);

            DB::beginTransaction();

            $oldData = $siswa->toArray();
            $siswa->update($request->only(['nama', 'alamat', 'status']));

            DB::commit();

            // Log::info('Siswa updated', [
            //     'user_id' => auth()->id(),
            //     'siswa_id' => $id,
            //     'old_data' => $oldData,
            //     'new_data' => $siswa->fresh()->toArray()
            // ]);

            return response()->json([
                'message' => 'Siswa berhasil diperbarui',
                'data' => $siswa->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            // Log::error('Error updating siswa', [
            //     'user_id' => auth()->id(),
            //     'siswa_id' => $id,
            //     'request_data' => $request->all(),
            //     'error' => $e->getMessage()
            // ]);

            return response()->json([
                'message' => 'Gagal memperbarui siswa',
                'error' => $e->getMessage()
            ], 500);
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

            // Since we're using soft deletes, this will set deleted_at
            $siswa->delete();

            DB::commit();

            // Log::info('Siswa soft deleted', [
            //     'user_id' => auth()->id(),
            //     'siswa_id' => $id,
            //     'siswa_data' => $siswa->toArray()
            // ]);

            return response()->json([
                'message' => 'Siswa berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            // Log::error('Error deleting siswa', [
            //     'user_id' => auth()->id(),
            //     'siswa_id' => $id,
            //     'error' => $e->getMessage()
            // ]);

            return response()->json([
                'message' => 'Gagal menghapus siswa',
                'error' => $e->getMessage()
            ], 500);
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
                return response()->json([
                    'message' => 'Siswa tidak dalam status terhapus'
                ], 400);
            }

            DB::beginTransaction();

            $siswa->restore();

            DB::commit();

            // Log::info('Siswa restored', [
            //     'user_id' => auth()->id(),
            //     'siswa_id' => $id
            // ]);

            return response()->json([
                'message' => 'Siswa berhasil dipulihkan',
                'data' => $siswa->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            // Log::error('Error restoring siswa', [
            //     'user_id' => auth()->id(),
            //     'siswa_id' => $id,
            //     'error' => $e->getMessage()
            // ]);

            return response()->json([
                'message' => 'Gagal memulihkan siswa',
                'error' => $e->getMessage()
            ], 500);
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