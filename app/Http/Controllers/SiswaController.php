<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Siswa;

class SiswaController extends Controller
{
    public function index(){
        $siswa = Siswa::all();
        return response()->json($siswa);
    }

    public function dh(Request $request){
        $search = $request->input('nama');
        $siswa = Siswa::where('nama', 'like', '%'.$search.'%')->get();
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

        return response()->json(['success' => true, 'data' => $siswa]);
    }

    public function delete($id){
        $siswa = Siswa::find($id);
        $siswa->delete();

        return response()->json(['success' => true]);
    }
}
