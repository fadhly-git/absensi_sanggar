<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class GenerateQrSiswa extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:qr-siswa';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate QR code for students';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating QR codes for all students...');

        $siswas = \App\Models\Siswa::all();
        $this->info('Found ' . $siswas->count() . ' students.');

        $count = 0;

        foreach ($siswas as $siswa) {
            if ($siswa->qrcode_path) {
                $this->info('siswa' . $siswa->nama . ' sudah punya Qr' . $siswa->qrcode_path);
                continue;
            }
            $qrData = [
                'id' => $siswa->id,
                'nama' => $siswa->nama,
                'tanggal_terdaftar' => $siswa->tanggal_terdaftar,
            ];
            $fileName = "qr_siswa/siswa_{$siswa->id}.png";
            \Storage::disk()->put($fileName, QrCode::format('png')
                ->size(300)
                ->generate(json_encode($qrData)));

            // Update the siswa record with the QR code path
            $siswa->qrcode_path = $fileName;
            $siswa->save();
            $count++;
            $this->info("QR code generated for {$siswa->nama} (ID: {$siswa->id}) at {$fileName}");
        }

        $this->info('QR codes generated successfully.');
    }
}
