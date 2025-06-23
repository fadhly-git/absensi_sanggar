<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Siswa;

class SiswaCon extends Controller
{
    public function index(){
        $siswa = Siswa::where('deleted', 0)->orderBy('nama', 'asc')->get();
        return response()->json($siswa);
    }

    public function store(){
        $requestData = request()->all();
        $siswa = new Siswa();
        $siswa->nama = $requestData['nama'];
        $siswa->alamat = $requestData['alamat'];
        $siswa->status = $requestData['status'];
        $siswa->save();

        return response()->json(['success' => true ]);
    }

    public function update($id){
        $requestData = request()->all();
        $siswa = Siswa::find($id);
        $siswa->nama = $requestData['nama'];
        $siswa->alamat = $requestData['alamat'];
        $siswa->status = $requestData['status'];
        $siswa->save();

        return response()->json(['success' => true]);
    }

    public function delete($id){
        $siswa = Siswa::find($id);
        $siswa->deleted = 1;
        $siswa->save();

        return response()->json(['success' => true]);
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
}
