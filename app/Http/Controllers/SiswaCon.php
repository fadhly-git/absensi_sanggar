<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Siswa;
use App\Exports\SiswaExport;
use Maatwebsite\Excel\Facades\Excel;

class SiswaCon extends Controller
{
    public function index(Request $request)
    {
        $query = Siswa::query()->orderBy('nama', 'asc');

        if ($request->has('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }
        
        // Eager load relasi jika dibutuhkan di frontend
        // $query->with('relasi'); 

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'status' => 'required|boolean',
        ]);

        $siswa = Siswa::create($validated);
        return response()->json($siswa, 201);
    }

    public function update(Request $request, Siswa $siswa)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'nullable|string',
            'status' => 'required|boolean',
        ]);

        $siswa->update($validated);
        return response()->json($siswa);
    }

    public function destroy(Siswa $siswa)
    {
        $siswa->delete();
        return response()->json(null, 204);
    }

    public function getCountSiswaAktif(){
        $result = DB::table('siswas')
        ->select(
            DB::raw("SUM(CASE WHEN status = 1 AND deleted = 0 THEN 1 ELSE 0 END) AS siswa_aktif"),
            DB::raw("SUM(CASE WHEN status = 0 AND deleted = 0 THEN 1 ELSE 0 END) AS siswa_nonaktif")
        )
        ->first();

        return response()->json($result);
    }

    public function getCountSiswa(){
        $result = DB::table('siswas')
        ->where('deleted', 0)
        ->select(
            DB::raw("COUNT(*) AS total_siswa")
        )
        ->first();

        return response()->json($result);
    }

    public function exportExcel()
    {
        // Get only active students (status = 1) using Laravel's proper soft delete
        $activeSiswa = Siswa::where('status', 1)->get();

        // Check if there are any active students
        if ($activeSiswa->isEmpty()) {
            return response()->json([
                'message' => 'Tidak ada data siswa aktif untuk diekspor.'
            ], 404);
        }

        $filename = 'siswa_aktif_' . date('Y-m-d') . '.xlsx';
        
        return Excel::download(new SiswaExport($activeSiswa), $filename);
    }
}
