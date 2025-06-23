<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreAbsensiRequest;
use App\Models\Siswa;
use App\Models\Absensi;
use App\Exports\WeeklyReportExport;
use App\Services\AbsensiReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AttendanceExport;
use DateTime;

class AbsensiController extends Controller
{

    protected $absensiReportService;

    public function __construct(AbsensiReportService $absensiReportService)
    {
        $this->absensiReportService = $absensiReportService;
    }

    public function store(StoreAbsensiRequest $request)
    {
        // Validasi dan mapping data sudah dihandle oleh StoreAbsensiRequest.
        $dataToInsert = $request->getAbsensiDataForInsert();

        if (empty($dataToInsert)) {
            return response()->json(['message' => 'Tidak ada data untuk disimpan.'], 400);
        }

        // Lakukan bulk insert untuk performa maksimal
        Absensi::insert($dataToInsert);

        return response()->json(['message' => 'Data absensi berhasil disimpan.'], 201);
    }

    public function generateWeeklyReport(Request $request)
    {
        $paginator = $this->absensiReportService->generateWeeklyReport($request);

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
     */
    public function exportExcel(Request $request)
    {
        // Atur agar limit tidak berlaku saat ekspor
        $request->merge(['limit' => 9999]); 
        
        $paginator = $this->absensiReportService->generateWeeklyReport($request);
        $data = $paginator->items();

        $filename = 'rekap_absensi_' . date('Y-m-d') . '.xlsx';
        return Excel::download(new AttendanceExport($data), $filename);
    }

    /**
     * Mendapatkan siswa yang tidak hadir pada tanggal tertentu.
     */
    public function getAbsentStudents(Request $request)
    {
        $validated = $request->validate(['date' => 'required|date_format:Y-m-d']);

        $absentStudents = Siswa::query()
            ->where('status', 1) // Asumsi hanya cek siswa aktif
            ->whereNull('deleted_at')
            ->whereDoesntHave('absensi', function ($query) use ($validated) {
                $query->whereDate('tanggal', $validated['date']);
            })
            ->orderBy('nama', 'ASC')
            ->select('id', 'nama', 'alamat')
            ->get();

        return response()->json($absentStudents);
    }

    /**
     * Membandingkan jumlah siswa pada 2 pertemuan terakhir.
     * Method ini sudah dioptimalkan.
     */
    public function jumlahSiswaMasuk()
    {
        $recentDates = DB::table('absensis')
            ->select('tanggal')
            ->distinct()
            ->orderBy('tanggal', 'desc')
            ->limit(2)
            ->pluck('tanggal');

        if ($recentDates->isEmpty()) {
            return response()->json(['minggu_ini' => 0, 'minggu_sebelumnya' => 0]);
        }

        $jumlahSiswaMingguIni = DB::table('absensis')
            ->where('tanggal', $recentDates->first())
            ->distinct()
            ->count('id_siswa');

        $jumlahSiswaMingguLalu = 0;
        if ($recentDates->count() > 1) {
            $jumlahSiswaMingguLalu = DB::table('absensis')
                ->where('tanggal', $recentDates->last())
                ->distinct()
                ->count('id_siswa');
        }

        return response()->json([
            'minggu_ini' => $jumlahSiswaMingguIni,
            'minggu_sebelumnya' => $jumlahSiswaMingguLalu,
        ]);
    }
}
