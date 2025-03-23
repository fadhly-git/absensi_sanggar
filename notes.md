# Absensi Sanggar

user required

- dashboard
-> akumulasi kedatangan 
-> saldo terakhir
-> jumlah siswa aktif

- daftar absen
-> input kehadiran all child

- keuangan 
-> sisa saldo
-> uang masuk
-> keterangan ^
-> uang keluar
-> keterangan ^
-> tanggal 

## tabel
- data hadir
-> id_siswa = fk table siswa
-> tanggal = date -> server side
-> notes = text nullable
-> bonus = boolean -> (akumulasi kedatangan dan saldo)

- data keuangan 
-> saldo_terakhir = string 
-> uang masuk % = text
-> keterangan % = text
-> uang keluar % = text 
-> keterangan  % = text
-> tangal = date

- data siswa 
-> nama = string
-> alamat = text
-> status = boolean -> (if lama tidak hadir do status=false)

% -> dinamis auto add new row