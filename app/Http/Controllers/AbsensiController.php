<?php

namespace App\Http\Controllers;

use App\Http\Requests\AbsensiReportRequest;
use App\Http\Requests\AbsensiQrRequest;
use App\Http\Resources\AbsensiReportResource;
use App\Services\AbsensiService;
use App\Services\AbsensiReportService;
use App\Http\Requests\StoreAbsensiRequest;
use App\Exports\AttendanceExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
     * Get riwayat absensi siswa
     */
    public function riwayatSiswa(Request $request, $user_id)
    {
        try {
            $mode = $request->input('mode', 'tahun'); // 'bulan' atau 'tahun'
            $bulan = $request->input('bulan', now()->format('m'));
            $tahun = $request->input('tahun', now()->format('Y'));

            $result = $this->reportService->getRiwayatSiswa(
                $user_id,
                $mode,
                $bulan,
                $tahun
            );

            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse('Terjadi kesalahan saat mengambil data riwayat', $e);
        }
    }

    /**
     * Get available years for student attendance
     */
    public function getAvailableYears(Request $request, $user_id)
    {
        try {
            $years = $this->reportService->getAvailableYears($user_id);
            return $this->successResponse(['years' => $years]);
        } catch (\Exception $e) {
            return $this->errorResponse('Terjadi kesalahan', $e, ['years' => []]);
        }
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

            return $this->successResponse([
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
            return $this->errorResponse('Terjadi kesalahan saat memuat data', $e);
        }
    }

    /**
     * store absensi QR code
     */
    public function absensiQr(AbsensiQrRequest $request)
    {
        // Validation sudah dilakukan di AbsensiQrRequest
        $scanResult = $request->input(0) ?? $request->all()[0] ?? null;

        if (!$scanResult || !isset($scanResult['rawValue'])) {
            \Log::warning('Absensi QR: Data tidak valid', ['payload' => $request->all()]);
            return $this->errorResponse('Data QR tidak valid', null, [], 400);
        }

        $rawValue = $scanResult['rawValue'];

        // Normalize URL - add https:// if missing
        $normalizedValue = $rawValue;
        if (!str_starts_with($rawValue, 'http://') && !str_starts_with($rawValue, 'https://')) {
            // Check if it looks like a URL (contains domain and /auth/qr)
            if (str_contains($rawValue, '/auth/qr') || str_contains($rawValue, 'token=')) {
                $normalizedValue = 'https://' . $rawValue;
            }
        }

        \Log::info('Absensi QR Scan', [
            'raw_value' => $rawValue,
            'normalized_value' => $normalizedValue,
            'is_url' => filter_var($normalizedValue, FILTER_VALIDATE_URL) !== false
        ]);

        $siswa = null;

        // TRY 1: Check if this is a URL-based QR (new dual-purpose format)
        if (filter_var($normalizedValue, FILTER_VALIDATE_URL)) {
            \Log::info('Detected URL-based QR format');

            // Parse URL untuk extract token (use normalized value)
            $parsedUrl = parse_url($normalizedValue);

            if (!isset($parsedUrl['query'])) {
                \Log::warning('QR URL tidak memiliki query parameter', ['url' => $normalizedValue]);
                return $this->errorResponse('QR URL tidak valid (tidak ada query parameter)', null, [], 400);
            }

            parse_str($parsedUrl['query'], $queryParams);

            if (!isset($queryParams['token'])) {
                \Log::warning('QR URL tidak memiliki token parameter', ['query_params' => $queryParams]);
                return $this->errorResponse('QR URL tidak valid (tidak ada token)', null, [], 400);
            }

            // Decode token untuk dapatkan user_id
            $qrTokenService = app(\App\Services\QrTokenService::class);
            $user = $qrTokenService->getUserFromToken($queryParams['token']);

            if (!$user) {
                \Log::warning('Token tidak valid atau user tidak ditemukan', ['token' => substr($queryParams['token'], 0, 20) . '...']);
                return $this->errorResponse('Token tidak valid atau user tidak ditemukan', null, [], 404);
            }

            // Get siswa from user
            $siswa = $user->siswas;
            if (!$siswa) {
                \Log::warning('User tidak memiliki relasi siswa', ['user_id' => $user->id, 'user_name' => $user->name]);
                return $this->errorResponse('User tidak terdaftar sebagai siswa', null, [], 404);
            }

            \Log::info('URL-based QR berhasil diparse', [
                'user_id' => $user->id,
                'siswa_id' => $siswa->id,
                'siswa_nama' => $siswa->nama ?? $user->name
            ]);
        }
        // TRY 2: JSON-based QR (backward compatibility)
        else {
            \Log::info('Mencoba parse sebagai JSON format');

            $qrData = json_decode($rawValue, true);

            // Check if QR data is valid JSON
            if (!$qrData) {
                \Log::error('Format QR tidak valid - Bukan URL dan bukan JSON', [
                    'raw_value' => $rawValue,
                    'json_error' => json_last_error_msg()
                ]);
                return $this->errorResponse('Format QR tidak valid. Silakan regenerate QR code dengan command: php artisan generate:qr-siswa --force', null, [], 400);
            }

            \Log::info('JSON-based QR detected', ['qr_data' => $qrData]);

            // Validate old attendance format
            if (!isset($qrData['id'])) {
                \Log::warning('JSON QR tidak memiliki ID siswa', ['qr_data' => $qrData]);
                return $this->errorResponse('QR tidak memiliki ID siswa yang valid', null, [], 400);
            }

            $siswa = \App\Models\Siswa::find($qrData['id']);
            if (!$siswa) {
                \Log::warning('Siswa tidak ditemukan dari JSON QR', ['siswa_id' => $qrData['id']]);
                return $this->errorResponse('Siswa tidak ditemukan', null, [], 404);
            }

            \Log::info('JSON QR berhasil diparse', [
                'siswa_id' => $siswa->id,
                'siswa_nama' => $siswa->nama
            ]);
        }

        // Safety check
        if (!$siswa) {
            \Log::error('Siswa object is null after parsing');
            return $this->errorResponse('Terjadi kesalahan saat memproses QR', null, [], 500);
        }

        // Continue with attendance logic (same for both old and new format)
        $tanggal = $scanResult['tanggal'] ?? date('Y-m-d');

        // Validasi: hanya izinkan absensi pada hari Minggu
        $tanggalCarbon = \Carbon\Carbon::parse($tanggal);
        if ($tanggalCarbon->dayOfWeek !== \Carbon\Carbon::SUNDAY) {
            return $this->errorResponse('Absensi hanya dapat dilakukan pada hari Minggu', null, [], 400);
        }

        // Cek apakah sudah absen pada tanggal ini
        $absenHariIni = \App\Models\Absensi::where('id_siswa', $siswa->id)
            ->where('tanggal', $tanggal)
            ->first();

        if ($absenHariIni) {
            return $this->errorResponse('Siswa sudah melakukan absensi pada tanggal ini', null, [], 409);
        }

        $dataToInsert = [
            [
                'id_siswa' => $siswa->id,
                'tanggal' => $tanggal,
            ]
        ];

        try {
            $result = $this->absensiService->saveQrRequest($dataToInsert);

            // Ambil data bonus dari $dataToInsert (karena sudah diisi sebelum insert)
            $isBonus = $result['bonus'] ?? false;

            // Log successful attendance
            Log::info('QR Absensi berhasil', [
                'siswa_id' => $siswa->id,
                'siswa_nama' => $siswa->nama,
                'tanggal' => $tanggal,
                'bonus' => $isBonus
            ]);
        } catch (\Exception $e) {
            Log::error('Error menyimpan absensi QR: ' . $e->getMessage(), [
                'siswa_id' => $siswa->id,
                'tanggal' => $tanggal,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->errorResponse('Gagal menyimpan absensi', $e);
        }

        return $this->successResponse([
            'bonus' => $isBonus,
        ], $isBonus ? 'Absensi berhasil dicatat. Selamat, Anda mendapatkan BONUS!' : 'Absensi berhasil dicatat', 201);
    }

    /**
     * Store absensi dengan validasi
     */
    public function store(StoreAbsensiRequest $request): JsonResponse
    {
        // \Log::info('Creating absensi with data:', $request->all());
        try {
            $result = $this->absensiService->saveFromRequest($request);

            return $this->successResponse($result, 'Data absensi berhasil disimpan.', 201);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, [], 400);
        } catch (\Exception $e) {
            return $this->errorResponse('Terjadi kesalahan pada server.', $e);
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

            return $this->successResponse($count);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal memuat statistik', $e);
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

            return $this->successResponse($siswa);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal memuat data siswa', $e);
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
            return $this->errorResponse('Gagal mengekspor data', $e);
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

        return $this->successResponse($data);
    }

    /**
     * Get diagram data for charting (daily total siswa)
     * Public endpoint used by frontend chart: /api/absensi/get-diagram
     */
    public function getDiagram(Request $request): JsonResponse
    {
        // optional query params: days (int)
        $days = (int) $request->input('days', 30);
        $days = max(7, min(365, $days));

        $end = now()->endOfDay();
        $start = now()->subDays($days - 1)->startOfDay();

        $cacheKey = "absensi_diagram_{$start->format('Ymd')}_{$end->format('Ymd')}";

        $data = \Cache::remember($cacheKey, 300, function () use ($start, $end) {
            $rows = \App\Models\Absensi::whereBetween('tanggal', [$start->format('Y-m-d'), $end->format('Y-m-d')])
                ->selectRaw('tanggal as date, COUNT(DISTINCT id_siswa) as total')
                ->groupBy('tanggal')
                ->orderBy('tanggal')
                ->get()
                ->keyBy('date');

            $period = [];
            $current = $start->copy();
            while ($current->lte($end)) {
                $d = $current->format('Y-m-d');
                $period[] = [
                    'date' => $d,
                    'total_siswa' => (int) ($rows->get($d)->total ?? 0),
                ];
                $current->addDay();
            }

            return $period;
        });

        return response()->json($data);
    }

    public function destroy($id): JsonResponse
    {
        $absensi = \App\Models\Absensi::findOrFail($id);
        $absensi->delete();

        \Cache::tags(['absensi', 'report', 'stats'])->flush();

        return $this->successResponse(null, 'Absensi berhasil dihapus');
    }
}
