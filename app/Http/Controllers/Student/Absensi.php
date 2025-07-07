<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class Absensi extends Controller
{
    public function generateQrCode($id)
    {
        $siswa = Siswa::find($id);
        $qrData = [
            'id' => $siswa->id,
            'nama' => $siswa->nama,
            'tanggal_terdaftar' => $siswa->tanggal_terdaftar,
        ];

        $fileName = "qr_siswa/siswa_{$siswa->id}.png";
        Storage::disk()->put($fileName, QrCode::format('png')
            ->size(300)
            ->generate(json_encode($qrData)));

        //update the siswa record with the QR code path
        $siswa->qrcode_path = $fileName;
        $siswa->save();

        return response()->json([
            'message' => 'QR Code generated successfully',
            'qrcode_path' => $fileName,
        ]);
    }

    public function getQr($id)
    {
        $siswa = Siswa::findOrFail($id);

        // Otorisasi: pastikan hanya siswa tsb atau admin yang boleh akses

        $path = $siswa->qrcode_path;
        if (!$path || !Storage::exists($path)) {
            abort(404);
        }

        $file = Storage::get($path);
        return response($file)->header('Content-Type', 'image/png');
    }
}
