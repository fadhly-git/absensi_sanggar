<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\QrTokenService;
use App\Services\QrCodeService;
use Illuminate\Console\Command;

class GenerateQrAuthToken extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'qr:generate-auth-token
                            {user_id? : ID user yang ingin di-generate QR auth token-nya}
                            {--all : Generate untuk semua user}
                            {--regenerate : Regenerate token yang sudah ada}
                            {--with-image : Generate QR code image sekaligus}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate QR authentication token untuk user';

    protected QrTokenService $qrTokenService;
    protected QrCodeService $qrCodeService;

    public function __construct(QrTokenService $qrTokenService, QrCodeService $qrCodeService)
    {
        parent::__construct();
        $this->qrTokenService = $qrTokenService;
        $this->qrCodeService = $qrCodeService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');
        $generateAll = $this->option('all');
        $regenerate = $this->option('regenerate');
        $withImage = $this->option('with-image');

        if ($generateAll) {
            return $this->generateForAllUsers($regenerate, $withImage);
        }

        if ($userId) {
            return $this->generateForUser($userId, $regenerate, $withImage);
        }

        $this->error('Harap berikan user_id atau gunakan flag --all');
        return Command::FAILURE;
    }

    protected function generateForUser($userId, $regenerate, $withImage)
    {
        $user = User::find($userId);

        if (!$user) {
            $this->error("User dengan ID {$userId} tidak ditemukan");
            return Command::FAILURE;
        }

        // Check if token already exists
        if ($user->qr_token && !$regenerate) {
            $this->info("User {$user->name} sudah memiliki QR token");
            $this->line("URL: " . $this->qrTokenService->generateQrUrl($user));
            $this->line("Gunakan flag --regenerate untuk membuat token baru");
            return Command::SUCCESS;
        }

        // Generate token
        if ($regenerate && $user->qr_token) {
            $token = $this->qrTokenService->regenerateToken($user);
            $this->info("Token berhasil di-regenerate untuk user: {$user->name}");
        } else {
            $token = $this->qrTokenService->generateToken($user);
            $user->update(['qr_token' => $token]);
            $this->info("Token berhasil di-generate untuk user: {$user->name}");
        }

        $qrUrl = $this->qrTokenService->generateQrUrl($user);
        $this->line("URL: {$qrUrl}");

        // Generate QR image if requested
        if ($withImage) {
            $this->info("Generating QR code image...");
            $imagePath = $this->qrCodeService->generateAuthQrCode($user, $qrUrl, $regenerate);

            if ($imagePath) {
                $fullPath = storage_path('app/public/' . $imagePath);
                $this->info("QR Image berhasil dibuat: {$imagePath}");
                $this->line("Full path: {$fullPath}");
            } else {
                $this->error("Gagal membuat QR image");
            }
        }

        return Command::SUCCESS;
    }

    protected function generateForAllUsers($regenerate, $withImage)
    {
        $users = User::all();
        $count = $users->count();

        if ($count === 0) {
            $this->error('Tidak ada user yang ditemukan');
            return Command::FAILURE;
        }

        $this->info("Generating QR auth tokens untuk {$count} user(s)...");

        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $success = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($users as $user) {
            try {
                // Skip if already has token and not regenerating
                if ($user->qr_token && !$regenerate) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                // Generate token
                if ($regenerate && $user->qr_token) {
                    $token = $this->qrTokenService->regenerateToken($user);
                } else {
                    $token = $this->qrTokenService->generateToken($user);
                    $user->update(['qr_token' => $token]);
                }

                // Generate image if requested
                if ($withImage) {
                    $qrUrl = $this->qrTokenService->generateQrUrl($user);
                    $this->qrCodeService->generateAuthQrCode($user, $qrUrl, $regenerate);
                }

                $success++;
            } catch (\Exception $e) {
                $failed++;
                \Log::error("Failed to generate QR token for user {$user->id}: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Berhasil: {$success}");
        if ($skipped > 0) {
            $this->warn("⏭ Dilewati (sudah ada token): {$skipped}");
        }
        if ($failed > 0) {
            $this->error("❌ Gagal: {$failed}");
        }

        return Command::SUCCESS;
    }
}
