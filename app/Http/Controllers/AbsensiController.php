<?php

namespace App\Http\Controllers;

use App\Services\AbsensiService;
use App\Services\AbsensiReportService;
use App\Http\Requests\StoreAbsensiRequest;
use App\Exports\AttendanceExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AbsensiController extends Controller
{
    protected $absensiService;
    protected $reportService;

    // Inject kedua service yang kita butuhkan
    public function __construct(AbsensiService $absensiService, AbsensiReportService $reportService)
    {
        $this->absensiService = $absensiService;
        $this->reportService = $reportService;
    }

    /**
     * Menyimpan data absensi baru. Delegasikan ke service.
     */
    public function store(StoreAbsensiRequest $request)
    {
        try {
            $this->absensiService->saveFromRequest($request);
            return response()->json(['message' => 'Data absensi berhasil disimpan.'], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            report($e); // Log error untuk debugging
            return response()->json(['message' => 'Terjadi kesalahan pada server.'], 500);
        }
    }

    /**
     * Men-generate laporan mingguan. Delegasikan ke service.
     * Method ini sudah baik, tidak perlu diubah.
     */
    public function generateWeeklyReport(Request $request)
    {
        $paginator = $this->reportService->generateWeeklyReport($request);

        return response()->json([
            'data' => $paginator->items(),
            'pagination' => [
                'currentPage' => $paginator->currentPage(),
                'totalPages' => $paginator->lastPage(),
                'totalRows' => $paginator->total(),
                'perPage' => $paginator->perPage(),
            ]
        ]);
    }

    /**
     * Mengekspor laporan ke Excel.
     * Method ini sudah baik, tidak perlu diubah.
     */
    public function exportExcel(Request $request)
    {
        $request->merge(['limit' => 9999]); 
        
        $paginator = $this->reportService->generateWeeklyReport($request);
        $data = $paginator->items();

        return Excel::download(new AttendanceExport($data), 'rekap_absensi_' . date('Y-m-d') . '.xlsx');
    }

    /**
     * Mendapatkan siswa yang tidak hadir. Delegasikan ke service.
     */
    public function getAbsentStudents(Request $request)
    {
        $validated = $request->validate(['date' => 'required|date_format:Y-m-d']);
        $absentStudents = $this->reportService->getAbsentStudentsForDate($validated['date']);

        return response()->json($absentStudents);
    }

    /**
     * Membandingkan jumlah siswa masuk. Delegasikan ke service.
     */
    public function jumlahSiswaMasuk()
    {
        $comparison = $this->reportService->getAttendanceCountComparison();
        return response()->json($comparison);
    }
}