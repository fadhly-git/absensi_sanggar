<?php

namespace App\Console\Commands;

use App\Models\Siswa;
use App\Services\QrCodeService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateQrSiswa extends Command
{
    protected $signature = 'generate:qr-siswa {--force : Overwrite existing QR codes}';
    protected $description = 'Generate QR code dengan nama siswa dan struktur folder berdasarkan tahun masuk';

    protected $qrCodeService;

    public function __construct(QrCodeService $qrCodeService)
    {
        parent::__construct();
        $this->qrCodeService = $qrCodeService;
    }

    public function handle()
    {
        $this->info('Memulai proses...');
        $siswa = Siswa::all();

        $this->info('Total siswa: ' . $siswa->count());

        $forceRegenerate = $this->option('force');
        $successCount = 0;
        $skippedCount = 0;
        $failedCount = 0;

        $progressBar = $this->output->createProgressBar($siswa->count());
        $progressBar->start();

        foreach ($siswa as $s) {
            $fileExists = $s->qrcode_path ? Storage::disk('public')->exists($s->qrcode_path) : false;

            // Skip jika sudah ada QR code di DB, file fisiknya ada, dan tidak force
            if ($s->qrcode_path && $fileExists && !$forceRegenerate) {
                $skippedCount++;
                $progressBar->advance();
                continue;
            }

            // Jika qrcode_path ada di DB TAPI file fisiknya hilang, paksa regenerate untuk user ini
            $isForce = $forceRegenerate || ($s->qrcode_path && !$fileExists);

            $result = $this->qrCodeService->generateQrCode($s, $isForce);

            if ($result) {
                $successCount++;
                $tahunMasuk = $s->tanggal_terdaftar ? \Carbon\Carbon::parse($s->tanggal_terdaftar)->format('Y') : 'umum';
                $this->newLine();
                $this->info("✓ Berhasil: {$s->nama} (Tahun: {$tahunMasuk})");
            } else {
                $failedCount++;
                $this->newLine();
                $this->error("✗ Gagal: {$s->nama}");
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Summary
        $this->info('════════════════════════════════════════');
        $this->info('Proses selesai!');
        $this->info('════════════════════════════════════════');
        $this->line("Berhasil dibuat  : <fg=green>{$successCount}</>");
        $this->line("Dilewati         : <fg=yellow>{$skippedCount}</>");
        $this->line("Gagal            : <fg=red>{$failedCount}</>");
        $this->info('════════════════════════════════════════');

        return 0;
    }
}
