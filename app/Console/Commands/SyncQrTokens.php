<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\QrTokenService;
use Illuminate\Console\Command;

class SyncQrTokens extends Command
{
    protected $signature = 'qr:sync-tokens {--regenerate : Regenerate existing tokens}';
    protected $description = 'Sync QR tokens untuk semua user (siswa) yang belum punya token';

    protected QrTokenService $qrTokenService;

    public function __construct(QrTokenService $qrTokenService)
    {
        parent::__construct();
        $this->qrTokenService = $qrTokenService;
    }

    public function handle()
    {
        $this->info('🔄 Memulai proses sync QR tokens...');
        $this->newLine();

        $regenerate = $this->option('regenerate');

        // Get all users dengan role siswa yang punya relasi siswa
        /** @var \Illuminate\Database\Eloquent\Collection<int, User> $users */
        $users = User::where('role', 'siswa')
            ->whereHas('siswas')
            ->when(!$regenerate, function ($query) {
                // Jika tidak regenerate, hanya ambil yang belum punya token
                return $query->whereNull('qr_token');
            })
            ->get();

        if ($users->isEmpty()) {
            $this->info('✓ Semua user sudah memiliki QR token!');
            return 0;
        }

        $this->info("Total user yang perlu di-sync: {$users->count()}");
        $this->newLine();

        $progressBar = $this->output->createProgressBar($users->count());
        $progressBar->start();

        $successCount = 0;
        $failedCount = 0;

        foreach ($users as $user) {
            try {
                if ($regenerate) {
                    $token = $this->qrTokenService->regenerateToken($user);
                    $this->newLine();
                    $this->info("✓ Token regenerated untuk: {$user->name}");
                } else {
                    $token = $this->qrTokenService->generateToken($user);
                    $user->update(['qr_token' => $token]);
                    $this->newLine();
                    $this->info("✓ Token dibuat untuk: {$user->name}");
                }
                $successCount++;
            } catch (\Exception $e) {
                $failedCount++;
                $this->newLine();
                $this->error("✗ Gagal untuk {$user->name}: {$e->getMessage()}");
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Summary
        $this->info('════════════════════════════════════════');
        $this->info('Proses selesai!');
        $this->info('════════════════════════════════════════');
        $this->line("Berhasil  : <fg=green>{$successCount}</>");
        $this->line("Gagal     : <fg=red>{$failedCount}</>");
        $this->info('════════════════════════════════════════');

        $this->newLine();
        $this->comment('💡 Langkah selanjutnya:');
        $this->line('   Jalankan command berikut untuk regenerate QR code:');
        $this->line('   <fg=yellow>php artisan generate:qr-siswa --force</>');

        return 0;
    }
}
