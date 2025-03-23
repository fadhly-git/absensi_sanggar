<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Absensi;
use App\Models\Siswa;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DaftarHadirController extends Controller
{

    public function getSiswa(Request $request)
    {
        //  
        $date = $request->input('date');
        Log::info('Date: ' . $date);
        $siswa =  DB::select('CALL GetAbsentStudents(?)', [$date]);
        return response()->json($siswa);
    }

    public function getAbsensi(Request $request)
    {
        // Ambil parameter query
        $date = $request->query('date'); // Nilai: "2025-03"
        $params = $request->query('params'); // Nilai: "bulan"

        // Panggil stored procedure berdasarkan parameter
        if ($params === 'bulan') {
            // Proses untuk mode bulan
            $result = DB::select('CALL GenerateAbsenReportWeekly(?, ?)', [$date, 'bulan']);
        } elseif ($params === 'tahun') {
            // Proses untuk mode tahun
            $result = DB::select('CALL GenerateAbsenReportWeekly(?, ?)', [$date, 'tahun']);
        } else {
            return response()->json(['error' => 'Invalid params value'], 400);
        }

        // Kembalikan hasil sebagai JSON
        return response()->json($result);
    }

    public function index()
    {
        $absensi = Absensi::all();
        $students = DB::select('CALL getSiswa()');
        return Inertia::render('daftar-hadir', [
            'absensi' => $absensi,
            'siswa' => $students,
        ]);
    }

    public function store(Request $request)
    {
        // Ambil data dari request
        $inputData = $request->all();

        
        // Ubah nama field sesuai dengan validasi
        $mappedData = collect($inputData['data'])->map(function ($item) {
            return [
                'id_siswa' => $item['id'],
                'tanggal' => $item['formattedDate'],
                'notes' => $item['keterangan'] ?? null,
                'bonus' => $item['bonus'] ? 1 : 0,
            ];
        })->toArray();

        // Validasi data yang sudah dimapping
        $validatedData = Validator::make(['data' => $mappedData], [
            'data' => 'required|array',
            'data.*.id_siswa' => 'required|integer|exists:siswas,id',
            'data.*.tanggal' => 'required|string',
            'data.*.bonus' => 'required|integer',
            'data.*.notes' => 'nullable|string',
        ])->validate();

        // Proses data setelah validasi
        $data = $validatedData['data'];

        // Simpan data ke tabel absensi
        foreach ($data as $absensiData) {
            Absensi::create($absensiData);
        }

        return response()->json([
            'message' => 'Data siswa berhasil disimpan.',
            'data' => $data,
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'id_siswa' => 'required',
            'tanggal' => 'required',
            'notes' => 'required',
            'bonus' => 'required'
        ]);

        Absensi::find($id)->update($request->all());
        return redirect()->route('daftar-hadir');
    }

    public function destroy($id)
    {
        Absensi::find($id)->delete();
        return redirect()->route('daftar-hadir');
    }
}
