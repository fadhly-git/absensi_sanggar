<?php

namespace App\Http\Controllers;

use App\Http\Requests\AbsensiReportRequest;
use App\Http\Resources\AbsensiReportResource;
use App\Services\AbsensiService;
use App\Services\AbsensiReportService;
use App\Http\Requests\StoreAbsensiRequest;
use App\Exports\AttendanceExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\JsonResponse;

class AbsensiController extends Controller
{
    public function __construct(
        protected AbsensiService $absensiService,
        protected AbsensiReportService $reportService
    ) {
    }

    /**
     * Get weekly report dengan caching
     */
    public function generateWeeklyReport(AbsensiReportRequest $request): JsonResponse
    {
        $validated = $request->validated();
        try {
            $paginator = $this->reportService->generateWeeklyReport(
                $validated['periode'],
                $validated['mode'],
                $validated['page'] ?? 1,
                min($validated['limit'] ?? 20, 50),
                $validated['search'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => AbsensiReportResource::collection($paginator->items()),
                'pagination' => [
                    'currentPage' => $paginator->currentPage(),
                    'totalPages' => $paginator->lastPage(),
                    'totalRows' => $paginator->total(),
                    'perPage' => $paginator->perPage(),
                    'hasMore' => $paginator->hasMorePages()
                ]
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memuat data',
                'error' => app()->environment('local') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Store absensi dengan validasi
     */
    public function store(StoreAbsensiRequest $request): JsonResponse
    {
        \Log::info('Creating absensi with data:', $request->all());
        try {
            $result = $this->absensiService->saveFromRequest($request);

            return response()->json([
                'success' => true,
                'message' => 'Data absensi berhasil disimpan.',
                'data' => $result
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.'
            ], 500);
        }
    }

    /**
     * Get attendance count dengan caching
     */
    public function getAttendanceCount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'periode' => 'required|string',
            'mode' => 'required|in:tahun,bulan'
        ]);

        try {
            $count = $this->reportService->getAttendanceCount(
                $validated['periode'],
                $validated['mode']
            );

            return response()->json([
                'success' => true,
                'data' => $count
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat statistik'
            ], 500);
        }
    }

    /**
     * Get active siswa untuk form absensi
     */
    public function getActiveSiswa(Request $request): JsonResponse
    {
        // Validasi tanggal
        $validatedDate = \Illuminate\Support\Facades\Validator::make(
            ['tanggal' => $request->input('tanggal')],
            ['tanggal' => 'required|date_format:Y-m-d']
        );
        try {
            $siswa = $this->absensiService->getActiveSiswaForAbsensi($validatedDate->validated()['tanggal']);

            return response()->json([
                'success' => true,
                'data' => $siswa
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data siswa'
            ], 500);
        }
    }

    /**
     * Export attendance report
     */
    public function exportWeeklyReport(Request $request)
    {
        $validated = $request->validate([
            'periode' => 'required|string',
            'mode' => 'required|in:tahun,bulan',
            'search' => 'nullable|string|max:255'
        ]);

        try {
            // Get all data untuk export (tanpa pagination)
            $data = $this->reportService->generateWeeklyReport(
                $validated['periode'],
                $validated['mode'],
                1,
                10000, // Large limit untuk export
                $validated['search'] ?? null
            );

            $filename = "absensi-{$validated['mode']}-{$validated['periode']}.xlsx";

            return Excel::download(
                new AttendanceExport($data->items()),
                $filename
            );
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengekspor data'
            ], 500);
        }
    }

    public function getSiswaHadirMingguIni(Request $request): JsonResponse
    {
        $start = $request->input('start_date');
        $end = $request->input('end_date');

        $data = \App\Models\Absensi::with(['siswa:id,alamat,user_id', 'siswa.user:id,name'])
            ->whereBetween('tanggal', [$start, $end])
            ->get()
            ->map(function ($absen) {
                return [
                    'id' => $absen->id,
                    'nama' => $absen->siswa->user->name ?? '-', // ambil nama dari tabel users
                    'alamat' => $absen->siswa->alamat ?? '-',
                    'tanggal' => $absen->tanggal,
                    'keterangan' => $absen->keterangan,
                    'bonus' => $absen->bonus,
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $absensi = \App\Models\Absensi::findOrFail($id);
        $absensi->delete();

        \Cache::tags(['absensi', 'report', 'stats'])->flush();

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil dihapus'
        ]);
    }
}