<?php

namespace App\Console\Commands;

use App\Models\Siswa;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckSiswaIntegrity extends Command
{
    protected $signature = 'siswa:check-integrity
                            {--fix : Perbaiki masalah yang ditemukan secara otomatis (role salah)}
                            {--detail : Tampilkan detail lengkap setiap baris bermasalah}';

    protected $description = 'Periksa integritas data antara tabel siswas dan users';

    private int $totalIssues = 0;

    public function handle(): int
    {
        $this->newLine();
        $this->line('╔══════════════════════════════════════════════════════╗');
        $this->line('║         CEK INTEGRITAS DATA SISWAS vs USERS          ║');
        $this->line('╚══════════════════════════════════════════════════════╝');
        $this->newLine();

        $fix    = $this->option('fix');
        $detail = $this->option('detail');

        // ── 1. Statistik umum ─────────────────────────────────────────────
        $this->printSection('📊 STATISTIK UMUM');
        $totalSiswas      = Siswa::withTrashed()->count();
        $activeSiswas     = Siswa::count();
        $deletedSiswas    = Siswa::onlyTrashed()->count();
        $totalUserSiswa   = User::where('role', 'siswa')->count();
        $totalUserNonSiswa = User::where('role', '!=', 'siswa')->count();

        $this->table(['Keterangan', 'Jumlah'], [
            ['Total siswas (termasuk soft-deleted)', $totalSiswas],
            ['Siswa aktif (tidak terhapus)',          $activeSiswas],
            ['Siswa soft-deleted',                   $deletedSiswas],
            ['User dengan role = siswa',              $totalUserSiswa],
            ['User dengan role ≠ siswa',              $totalUserNonSiswa],
        ]);

        // ── 2. Siswas tanpa user (orphan) ─────────────────────────────────
        $this->printSection('🔴 SISWAS TANPA RELASI USER (Orphan)');
        $orphanSiswas = Siswa::withTrashed()
            ->whereNull('user_id')
            ->orWhereDoesntHave('user')
            ->get(['id', 'user_id', 'alamat', 'status', 'tanggal_terdaftar', 'deleted_at']);

        if ($orphanSiswas->isEmpty()) {
            $this->line('  <fg=green>✓ Tidak ada orphan siswas.</>');
        } else {
            $this->totalIssues += $orphanSiswas->count();
            $this->warn("  ✗ Ditemukan {$orphanSiswas->count()} siswa tanpa user!");
            if ($detail) {
                $this->table(
                    ['ID Siswa', 'user_id', 'Alamat', 'Status', 'Terdaftar', 'Deleted?'],
                    $orphanSiswas->map(fn($s) => [
                        $s->id,
                        $s->user_id ?? '(NULL)',
                        substr($s->alamat ?? '-', 0, 40),
                        $s->status ? 'Aktif' : 'Non-Aktif',
                        $s->tanggal_terdaftar,
                        $s->deleted_at ? '✓ ' . $s->deleted_at : '-',
                    ])->toArray()
                );
            }
        }

        // ── 3. User role=siswa tanpa data siswas ──────────────────────────
        $this->printSection('🔴 USER ROLE=SISWA TANPA DATA SISWAS');
        $usersWithoutSiswa = User::where('role', 'siswa')
            ->whereDoesntHave('siswas')
            ->get(['id', 'name', 'email', 'nis', 'created_at']);

        if ($usersWithoutSiswa->isEmpty()) {
            $this->line('  <fg=green>✓ Semua user siswa memiliki data siswas.</>');
        } else {
            $this->totalIssues += $usersWithoutSiswa->count();
            $this->warn("  ✗ Ditemukan {$usersWithoutSiswa->count()} user siswa tanpa data di tabel siswas!");
            if ($detail) {
                $this->table(
                    ['ID User', 'Nama', 'Email', 'NIS', 'Dibuat'],
                    $usersWithoutSiswa->map(fn($u) => [
                        $u->id, $u->name, $u->email, $u->nis ?? '-', $u->created_at,
                    ])->toArray()
                );
            }
        }

        // ── 4. User role ≠ siswa tapi punya data siswas ───────────────────
        $this->printSection('🟡 USER ROLE BUKAN SISWA TAPI PUNYA DATA SISWAS');
        $wrongRoleUsers = User::where('role', '!=', 'siswa')
            ->whereHas('siswas')
            ->get(['id', 'name', 'email', 'role', 'nis']);

        if ($wrongRoleUsers->isEmpty()) {
            $this->line('  <fg=green>✓ Tidak ada user dengan role salah.</>');
        } else {
            $this->totalIssues += $wrongRoleUsers->count();
            $this->warn("  ✗ Ditemukan {$wrongRoleUsers->count()} user dengan role salah!");
            $this->table(
                ['ID User', 'Nama', 'Email', 'Role Sekarang', 'NIS'],
                $wrongRoleUsers->map(fn($u) => [
                    $u->id, $u->name, $u->email, $u->role, $u->nis ?? '-',
                ])->toArray()
            );

            if ($fix) {
                $fixed = $wrongRoleUsers->each(fn($u) => $u->update(['role' => 'siswa']));
                $this->info("  ✓ Role diperbaiki untuk {$wrongRoleUsers->count()} user.");
            } else {
                $this->comment('  💡 Jalankan dengan --fix untuk memperbaiki role secara otomatis.');
            }
        }

        // ── 5. Siswas dengan user_id duplikat ─────────────────────────────
        $this->printSection('🟡 USER_ID DUPLIKAT DI TABEL SISWAS');
        $duplicateUserIds = DB::table('siswas')
            ->whereNull('deleted_at')
            ->select('user_id', DB::raw('COUNT(*) as jumlah'))
            ->groupBy('user_id')
            ->having('jumlah', '>', 1)
            ->get();

        if ($duplicateUserIds->isEmpty()) {
            $this->line('  <fg=green>✓ Tidak ada user_id duplikat.</>');
        } else {
            $this->totalIssues += $duplicateUserIds->count();
            $this->warn("  ✗ Ditemukan {$duplicateUserIds->count()} user_id yang terduplikat!");
            $this->table(
                ['user_id', 'Nama User', 'Jumlah Siswa'],
                $duplicateUserIds->map(function ($row) {
                    $user = User::find($row->user_id);
                    return [
                        $row->user_id,
                        $user?->name ?? '(User tidak ditemukan)',
                        $row->jumlah,
                    ];
                })->toArray()
            );
        }

        // ── 6. Siswas tanpa QR code ───────────────────────────────────────
        $this->printSection('🟡 SISWAS AKTIF TANPA QR CODE');
        $noQrSiswas = Siswa::whereNull('qrcode_path')
            ->orWhere('qrcode_path', '')
            ->with('user:id,name,nis')
            ->get(['id', 'user_id', 'status', 'tanggal_terdaftar']);

        if ($noQrSiswas->isEmpty()) {
            $this->line('  <fg=green>✓ Semua siswa aktif memiliki QR code.</>');
        } else {
            $this->warn("  ⚠ Ditemukan {$noQrSiswas->count()} siswa tanpa QR code.");
            if ($detail) {
                $this->table(
                    ['ID Siswa', 'Nama', 'NIS', 'Status'],
                    $noQrSiswas->map(fn($s) => [
                        $s->id,
                        $s->user?->name ?? '-',
                        $s->user?->nis ?? '-',
                        $s->status ? 'Aktif' : 'Non-Aktif',
                    ])->toArray()
                );
            }
            $this->comment('  💡 Jalankan: php artisan generate:qr-siswa');
        }

        // ── 7. User siswa tanpa NIS ───────────────────────────────────────
        $this->printSection('🟡 USER SISWA TANPA NIS');
        $noNisUsers = User::where('role', 'siswa')
            ->whereNull('nis')
            ->orWhere('nis', '')
            ->get(['id', 'name', 'email', 'created_at']);

        if ($noNisUsers->isEmpty()) {
            $this->line('  <fg=green>✓ Semua user siswa memiliki NIS.</>');
        } else {
            $this->warn("  ⚠ Ditemukan {$noNisUsers->count()} user siswa tanpa NIS.");
            if ($detail) {
                $this->table(
                    ['ID', 'Nama', 'Email', 'Dibuat'],
                    $noNisUsers->map(fn($u) => [
                        $u->id, $u->name, $u->email, $u->created_at,
                    ])->toArray()
                );
            }
        }

        // ── 8. Ringkasan akhir ────────────────────────────────────────────
        $this->newLine();
        $this->line('══════════════════════════════════════════════════════');

        if ($this->totalIssues === 0) {
            $this->info('✅ SEMUA DATA KONSISTEN! Tidak ada masalah integritas.');
        } else {
            $this->error("❌ Ditemukan {$this->totalIssues} masalah integritas.");
            $this->newLine();
            $this->comment('Tip: Jalankan dengan flag untuk info lebih lanjut:');
            $this->line('  <fg=yellow>php artisan siswa:check-integrity --detail</>   → tampilkan semua baris bermasalah');
            $this->line('  <fg=yellow>php artisan siswa:check-integrity --fix</>      → perbaiki role otomatis');
        }

        $this->line('══════════════════════════════════════════════════════');
        $this->newLine();

        return $this->totalIssues > 0 ? 1 : 0;
    }

    private function printSection(string $title): void
    {
        $this->newLine();
        $this->line("┌─ {$title}");
    }
}
