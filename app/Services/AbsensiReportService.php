<?php

namespace App\Services;

use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class AbsensiReportService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function generateWeeklyReport(Request $request)
    {
        $validated = $request->validate([
            'periode' => 'required|string|max:7',
            'mode' => 'required|in:bulan,tahun',
            'page' => 'integer|min:1',
            'limit' => 'integer|min:1|max:200',
            'search' => 'nullable|string|max:255',
        ]);

        $periode = $validated['periode'];
        $mode = $validated['mode'];
        $page = $validated['page'] ?? 1;
        $limit = $validated['limit'] ?? 35;
        $search = $validated['search'] ?? null;

        $periodeDate = Carbon::createFromFormat($mode === 'bulan' ? 'Y-m' : 'Y', $periode);
        $startDate = $periodeDate->copy()->startOf($mode === 'bulan' ? 'month' : 'year');
        $endDate = $periodeDate->copy()->endOf($mode === 'bulan' ? 'month' : 'year');

        // Generate semua hari Minggu dalam rentang tanggal
        $sundays = [];
        // 2. Ubah Carbon::SUNDAY menjadi CarbonInterface::SUNDAY
        $current = $startDate->copy()->startOfWeek(CarbonInterface::SUNDAY);
        while ($current <= $endDate) {
            if ($current >= $startDate) {
                $sundays[] = $current->format('Y-m-d');
            }
            $current->addWeek();
        }

        // Base Query menggunakan Query Builder
        $query = DB::table('siswas as s')
            ->select('s.id as siswa_id', 's.nama as siswa_nama', 's.alamat as siswa_alamat', 's.status as siswa_status')
            ->whereNull('s.deleted_at') // Hanya ambil siswa yang aktif
            ->orderBy('s.nama', 'ASC');

        // Tambahkan kolom dinamis untuk setiap hari Minggu
        foreach ($sundays as $sunday) {
            $query->addSelect(DB::raw(
                "MAX(CASE WHEN a.tanggal = ? THEN CASE WHEN a.bonus = 1 THEN 'B' ELSE 'H' END END) AS `$sunday`"
            ));
        }

        // Left Join dengan subquery untuk performa lebih baik
        $query->leftJoin('absensis as a', function ($join) use ($startDate, $endDate, $sundays) {
            $join->on('s.id', '=', 'a.id_siswa')
                ->whereIn('a.tanggal', $sundays);
        });

        // Bind tanggal ke Raw Select
        $query->addBinding($sundays, 'select');

        // Tambahkan filter pencarian
        if ($search) {
            $query->where('s.nama', 'like', '%' . $search . '%');
        }

        $query->groupBy('s.id', 's.nama', 's.alamat', 's.status');

        // Paginasi
        return $query->paginate($limit, ['*'], 'page', $page);
    }

    /**
     * Mendapatkan siswa yang tidak diabsen pada tanggal tertentu.
     * Logika dipindahkan dari AbsensiController@getAbsentStudents.
     *
     * @param string $date (format Y-m-d)
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAbsentStudentsForDate(string $date)
    {
        return Siswa::query()
            ->where('status', 1) // Asumsi hanya cek siswa aktif
            ->whereNull('deleted_at')
            ->whereDoesntHave('absensi', function ($query) use ($date) {
                $query->whereDate('tanggal', $date);
            })
            ->orderBy('nama', 'ASC')
            ->select('id', 'nama', 'alamat')
            ->get();
    }

    /**
     * Membandingkan jumlah siswa pada 2 pertemuan terakhir.
     * Logika dipindahkan dari AbsensiController@jumlahSiswaMasuk.
     *
     * @return array
     */
    public function getAttendanceCountComparison(): array
    {
        $recentDates = DB::table('absensis')
            ->select('tanggal')
            ->distinct()
            ->orderBy('tanggal', 'desc')
            ->limit(2)
            ->pluck('tanggal');

        if ($recentDates->isEmpty()) {
            return ['minggu_ini' => 0, 'minggu_sebelumnya' => 0];
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

        return [
            'minggu_ini' => $jumlahSiswaMingguIni,
            'minggu_sebelumnya' => $jumlahSiswaMingguLalu,
        ];
    }
}
