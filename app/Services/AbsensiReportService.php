<?php

namespace App\Services;

use App\Models\Absensi;
use App\Models\Siswa;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AbsensiReportService
{

    /**
     * Ambil riwayat absensi siswa per bulan atau per tahun.
     *
     * @param int $user_id
     * @param string $mode 'bulan' atau 'tahun'
     * @param int|string $bulan
     * @param int|string $tahun
     * @return array
     */
    public function getRiwayatSiswa($user_id, $mode = 'tahun', $bulan = null, $tahun = null): array
    {
        try {
            $bulan = $bulan ?? now()->format('m');
            $tahun = $tahun ?? now()->format('Y');

            $siswa = Siswa::with('user')->where('user_id', $user_id)->firstOrFail();

            $result = [
                'siswa_id' => $siswa->id,
                'siswa_nama' => $siswa->user->name ?? 'N/A',
                'siswa_alamat' => $siswa->alamat,
                'siswa_status' => $siswa->status,
            ];

            if ($mode === 'tahun') {
                // OPTIMASI: Ambil semua tanggal unik untuk tahun ini (SYSTEM-WIDE)
                // Menggunakan cache 10 menit karena tanggal jarang berubah
                $cacheKey = "all_attendance_dates_{$tahun}";
                $allUniqueDates = \Cache::remember($cacheKey, 600, function () use ($tahun) {
                    return Absensi::whereYear('tanggal', $tahun)
                        ->distinct()
                        ->orderBy('tanggal')
                        ->pluck('tanggal')
                        ->map(fn($date) => Carbon::parse($date)->format('Y-m-d'))
                        ->toArray();
                });

                // Ambil absensi siswa ini untuk tahun ini
                $siswaAbsensi = Absensi::where('id_siswa', $siswa->id)
                    ->whereYear('tanggal', $tahun)
                    ->get()
                    ->keyBy(fn($record) => Carbon::parse($record->tanggal)->format('Y-m-d'));

                // Group by month
                $result['absensi'] = [];
                foreach ($allUniqueDates as $tanggal) {
                    $bulanNum = (int) Carbon::parse($tanggal)->format('m');

                    // Cek apakah siswa hadir di tanggal ini
                    if (isset($siswaAbsensi[$tanggal])) {
                        $result['absensi'][$bulanNum][$tanggal] = $siswaAbsensi[$tanggal]->bonus ? 'B' : 'H';
                    } else {
                        $result['absensi'][$bulanNum][$tanggal] = 'T'; // Tidak hadir
                    }
                }

                // Pastikan semua bulan ada key (walaupun kosong)
                for ($m = 1; $m <= 12; $m++) {
                    if (!isset($result['absensi'][$m])) {
                        $result['absensi'][$m] = [];
                    }
                }
            } else {
                // OPTIMASI: mode bulanan - ambil tanggal unik untuk bulan ini (SYSTEM-WIDE)
                $cacheKey = "all_attendance_dates_{$tahun}_{$bulan}";
                $allUniqueDates = \Cache::remember($cacheKey, 600, function () use ($tahun, $bulan) {
                    return Absensi::whereYear('tanggal', $tahun)
                        ->whereMonth('tanggal', $bulan)
                        ->distinct()
                        ->orderBy('tanggal')
                        ->pluck('tanggal')
                        ->map(fn($date) => Carbon::parse($date)->format('Y-m-d'))
                        ->toArray();
                });

                // Ambil absensi siswa ini untuk bulan ini
                $siswaAbsensi = Absensi::where('id_siswa', $siswa->id)
                    ->whereYear('tanggal', $tahun)
                    ->whereMonth('tanggal', $bulan)
                    ->get()
                    ->keyBy(fn($record) => Carbon::parse($record->tanggal)->format('Y-m-d'));

                $result['absensi'][(int) $bulan] = [];
                foreach ($allUniqueDates as $tanggal) {
                    // Cek apakah siswa hadir di tanggal ini
                    if (isset($siswaAbsensi[$tanggal])) {
                        $result['absensi'][(int) $bulan][$tanggal] = $siswaAbsensi[$tanggal]->bonus ? 'B' : 'H';
                    } else {
                        $result['absensi'][(int) $bulan][$tanggal] = 'T'; // Tidak hadir
                    }
                }
            }

            return $result;
        } catch (\Exception $e) {
            \Log::error('Error in getRiwayatSiswa: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get available years (SYSTEM-WIDE - years where ANY student has attendance records)
     * Dengan cache untuk mengurangi beban database
     */
    public function getAvailableYears($user_id): array
    {
        try {
            // Cache system-wide available years selama 1 jam
            $cacheKey = "system_available_years";
            $years = \Cache::remember($cacheKey, 3600, function () {
                return Absensi::selectRaw('DISTINCT YEAR(tanggal) as year')
                    ->orderBy('year', 'desc')
                    ->pluck('year')
                    ->toArray();
            });

            return $years;
        } catch (\Exception $e) {
            \Log::error('Error in getAvailableYears: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Generate weekly report dengan optimasi query
     */
    public function generateWeeklyReport(
        string $periode,
        string $mode,
        int $page = 1,
        int $limit = 20,
        ?string $search = null
    ): LengthAwarePaginator {
        $cacheKey = "weekly_report_" . md5($periode . $mode . $page . $limit . ($search ?? ''));
        return Cache::tags(['absensi', 'report'])->remember($cacheKey, 300, function () use ($periode, $mode, $page, $limit, $search) {
            return $this->buildOptimizedQuery($periode, $mode, $page, $limit, $search);
        });
    }

    private function buildOptimizedQuery(
        string $periode,
        string $mode,
        int $page,
        int $limit,
        ?string $search
    ): LengthAwarePaginator {
        [$startDate, $endDate] = $this->getDateRange($periode, $mode);
        $sundays = $this->getSundaysInRange($startDate, $endDate);

        if (empty($sundays)) {
            return new LengthAwarePaginator([], 0, $limit, $page);
        }

        // Query siswa + join user
        $baseQuery = DB::table('siswas as s')
            ->leftJoin('users as u', 's.user_id', '=', 'u.id')
            ->select([
                's.id as siswa_id',
                'u.name as siswa_nama',
                'u.name as user_name',
                's.alamat as siswa_alamat',
                's.status as siswa_status'
            ])
            ->whereNull('s.deleted_at')
            ->where('s.status', 1);

        if ($search) {
            $baseQuery->where(function ($q) use ($search) {
                $q->where('u.name', 'like', "%{$search}%")
                    ->orWhere('s.alamat', 'like', "%{$search}%");
            });
        }

        $total = (clone $baseQuery)->count();
        $offset = ($page - 1) * $limit;
        $siswaData = $baseQuery->skip($offset)->take($limit)->get();

        $siswaIds = $siswaData->pluck('siswa_id')->toArray();

        // Ambil absensi untuk siswa di halaman ini
        $attendanceData = DB::table('absensis as a')
            ->select([
                'a.id_siswa',
                'a.tanggal',
                DB::raw('CASE WHEN a.bonus = 1 THEN "B" ELSE "H" END as status')
            ])
            ->whereBetween('a.tanggal', [$startDate, $endDate])
            ->whereIn('a.tanggal', $sundays)
            ->whereIn('a.id_siswa', $siswaIds)
            ->get()
            ->groupBy('id_siswa');

        // Merge absensi ke siswa
        $results = $siswaData->map(function ($siswa) use ($attendanceData, $sundays) {
            $siswaAttendance = $attendanceData->get($siswa->siswa_id, collect());
            $absensi = [];
            foreach ($sundays as $sunday) {
                $attendance = $siswaAttendance->firstWhere('tanggal', $sunday);
                $absensi[$sunday] = $attendance ? $attendance->status : 'T';
            }
            $siswa->absensi = $absensi;
            return $siswa;
        });

        return new LengthAwarePaginator(
            $results,
            $total,
            $limit,
            $page,
            [
                'path' => request()->url(),
                'pageName' => 'page'
            ]
        );
    }

    /**
     * Optimized query builder
     */


    /**
     * Get attendance count dengan optimasi
     */
    public function getAttendanceCount(string $periode, string $mode): array
    {
        $cacheKey = "attendance_count_{$periode}_{$mode}";

        return Cache::tags(['absensi', 'stats'])->remember($cacheKey, 600, function () use ($periode, $mode) {
            [$startDate, $endDate] = $this->getDateRange($periode, $mode);

            // Single query untuk mendapatkan count
            $stats = DB::table('absensis as a')
                ->select([
                    DB::raw('COUNT(DISTINCT a.id_siswa) as siswa_hadir'),
                    DB::raw('(SELECT COUNT(*) FROM siswas WHERE status = 1 AND deleted_at IS NULL) as total_siswa')
                ])
                ->whereBetween('a.tanggal', [$startDate, $endDate])
                ->first();

            $masuk = $stats->siswa_hadir ?? 0;
            $totalSiswa = $stats->total_siswa ?? 0;
            $keluar = max(0, $totalSiswa - $masuk);

            return compact('masuk', 'keluar');
        });
    }

    /**
     * Get Sundays in date range dengan optimasi
     */
    private function getSundaysInRange(string $startDate, string $endDate): array
    {
        $cacheKey = "sundays_" . md5($startDate . $endDate);

        return Cache::remember($cacheKey, 3600, function () use ($startDate, $endDate) {
            $sundays = [];
            $start = Carbon::parse($startDate);
            $end = Carbon::parse($endDate);

            // Find first Sunday
            $current = $start->copy();
            while ($current->dayOfWeek !== Carbon::SUNDAY && $current->lte($end)) {
                $current->addDay();
            }

            // Collect all Sundays
            while ($current->lte($end)) {
                $sundays[] = $current->format('Y-m-d');
                $current->addWeek();
            }

            return $sundays;
        });
    }

    /**
     * Helper methods
     */
    private function getDateRange(string $periode, string $mode): array
    {
        if ($mode === 'tahun') {
            return [
                $periode . '-01-01',
                $periode . '-12-31'
            ];
        } else {
            $date = Carbon::createFromFormat('Y-m', $periode);
            return [
                $date->startOfMonth()->format('Y-m-d'),
                $date->endOfMonth()->format('Y-m-d')
            ];
        }
    }
}
