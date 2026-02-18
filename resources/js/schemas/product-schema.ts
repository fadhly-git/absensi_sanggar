import { z } from 'zod';

export const sizeChartSchema = z
    .object({
        category: z.enum(['kids', 'adults'], {
            required_error: 'Kategori wajib diisi',
        }),
        size_label: z.string().min(1, 'Label ukuran wajib diisi'),
        width_cm: z.number().min(1, 'Lebar harus diisi'),
        length_cm: z.number().min(1, 'Panjang harus diisi'),
        price_short_sleeve: z.number().min(0, 'Harga wajib diisi'),
        price_long_sleeve: z.number().min(0, 'Harga wajib diisi'),
    })
    .refine((data) => data.price_long_sleeve > data.price_short_sleeve, {
        message: 'Harga lengan panjang harus lebih mahal dari lengan pendek',
        path: ['price_long_sleeve'],
    });

export const productFormSchema = z
    .object({
        name: z.string().min(1, 'Nama produk wajib diisi'),
        description: z.string().optional(),
        po_deadline: z.string().min(1, 'Deadline PO wajib diisi'),
        image: z.any().optional(),
        size_charts: z.array(sizeChartSchema).min(1, 'Minimal 1 ukuran'),
    })
    .refine(
        (data) => {
            const deadline = new Date(data.po_deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return deadline > today;
        },
        {
            message: 'Deadline PO harus lebih dari hari ini',
            path: ['po_deadline'],
        },
    );
