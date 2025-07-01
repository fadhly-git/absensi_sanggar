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

    /**
     * Optimized query builder
     */
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

        // Optimized base query
        $baseQuery = DB::table('siswas as s')
            ->select([
                's.id as siswa_id',
                's.nama as siswa_nama',
                's.alamat as siswa_alamat',
                's.status as siswa_status'
            ])
            ->whereNull('s.deleted_at')
            ->where('s.status', 1);

        // Apply search filter
        if ($search) {
            $baseQuery->where(function ($q) use ($search) {
                $q->where('s.nama', 'like', "%{$search}%")
                    ->orWhere('s.alamat', 'like', "%{$search}%");
            });
        }

        // Get total count for pagination
        $totalQuery = clone $baseQuery;
        $total = $totalQuery->count();

        // Add attendance columns using LEFT JOIN for better performance
        $attendanceSubquery = DB::table('absensis as a')
            ->select([
                'a.id_siswa',
                'a.tanggal',
                DB::raw('CASE WHEN a.bonus = 1 THEN "B" ELSE "H" END as status')
            ])
            ->whereBetween('a.tanggal', [$startDate, $endDate])
            ->whereIn('a.tanggal', $sundays);

        // Create pivot table for attendance
        $attendanceData = $attendanceSubquery->get()->groupBy('id_siswa');

        // Get paginated siswa
        $offset = ($page - 1) * $limit;
        $siswaData = $baseQuery->skip($offset)->take($limit)->get();

        // Merge attendance data with siswa data
        $results = $siswaData->map(function ($siswa) use ($attendanceData, $sundays) {
            $siswaAttendance = $attendanceData->get($siswa->siswa_id, collect());

            foreach ($sundays as $sunday) {
                $attendance = $siswaAttendance->firstWhere('tanggal', $sunday);
                $siswa->{$sunday} = $attendance ? $attendance->status : 'T';
            }

            return $siswa;
        });

        return new LengthAwarePaginator(
            $results->toArray(),
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