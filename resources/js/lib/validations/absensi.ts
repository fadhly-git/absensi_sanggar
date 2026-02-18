import { z } from "zod"
import { isSunday } from "@/components/molecules/sunday-picker"

export const absensiQrSchema = z.object({
  tanggal: z.date({
    required_error: "Tanggal wajib dipilih",
    invalid_type_error: "Format tanggal tidak valid",
  }).refine((date) => isSunday(date), {
    message: "Absensi hanya dapat dilakukan pada hari Minggu",
  }),
  qrData: z.object({
    id: z.number(),
    nama: z.string(),
    tanggal_terdaftar: z.string().optional(),
  })
})

export const absensiInputSchema = z.object({
  tanggal: z.string().refine((date) => {
    const d = new Date(date)
    return isSunday(d)
  }, {
    message: "Absensi hanya dapat dilakukan pada hari Minggu",
  }),
  siswa_ids: z.array(z.number()).min(1, {
    message: "Pilih minimal 1 siswa",
  }),
  keterangan: z.string().optional(),
})

export type AbsensiQrInput = z.infer<typeof absensiQrSchema>
export type AbsensiInput = z.infer<typeof absensiInputSchema>
