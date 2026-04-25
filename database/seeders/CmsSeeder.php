<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CmsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed Post Categories
        $categories = [
            ['name' => 'Event', 'slug' => 'event', 'description' => 'Kegiatan dan acara sanggar', 'color' => '#3b82f6', 'order' => 1],
            ['name' => 'Ujian', 'slug' => 'ujian', 'description' => 'Ujian dan tes kenaikan tingkat', 'color' => '#f59e0b', 'order' => 2],
            ['name' => 'Pentas', 'slug' => 'pentas', 'description' => 'Pertunjukan dan penampilan', 'color' => '#8b5cf6', 'order' => 3],
            ['name' => 'Latihan', 'slug' => 'latihan', 'description' => 'Jadwal dan info latihan', 'color' => '#10b981', 'order' => 4],
            ['name' => 'Pengumuman', 'slug' => 'pengumuman', 'description' => 'Pengumuman penting', 'color' => '#ef4444', 'order' => 5],
        ];

        foreach ($categories as $category) {
            DB::table('post_categories')->updateOrInsert(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'color' => $category['color'],
                    'order' => $category['order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // Seed Site Settings
        $settings = [
            // General Settings
            ['key' => 'site_name', 'value' => 'Ngesti Laras Budaya', 'type' => 'text', 'group' => 'general', 'description' => 'Nama website'],
            ['key' => 'site_tagline', 'value' => 'Pelestari Seni Tari Tradisional Nusantara', 'type' => 'text', 'group' => 'general', 'description' => 'Tagline website'],
            ['key' => 'site_logo', 'value' => null, 'type' => 'image', 'group' => 'general', 'description' => 'Logo website'],
            ['key' => 'site_favicon', 'value' => null, 'type' => 'image', 'group' => 'general', 'description' => 'Favicon website'],
            ['key' => 'year_founded', 'value' => '2010', 'type' => 'text', 'group' => 'general', 'description' => 'Tahun berdiri sanggar'],

            // Contact Settings
            ['key' => 'contact_email', 'value' => 'info@ngestilarasbudaya.com', 'type' => 'text', 'group' => 'contact', 'description' => 'Email kontak'],
            ['key' => 'contact_phone', 'value' => '+62 xxx xxxx xxxx', 'type' => 'text', 'group' => 'contact', 'description' => 'Nomor telepon'],
            ['key' => 'contact_whatsapp', 'value' => '+62 xxx xxxx xxxx', 'type' => 'text', 'group' => 'contact', 'description' => 'Nomor WhatsApp'],
            ['key' => 'contact_address', 'value' => 'Meteseh, Boja, Kendal, Jawa Tengah', 'type' => 'textarea', 'group' => 'contact', 'description' => 'Alamat lengkap'],
            ['key' => 'contact_map_embed', 'value' => null, 'type' => 'textarea', 'group' => 'contact', 'description' => 'Google Maps embed code'],

            // SEO Settings
            ['key' => 'seo_meta_title', 'value' => 'Ngesti Laras Budaya - Sanggar Tari Tradisional Kendal', 'type' => 'text', 'group' => 'seo', 'description' => 'Default meta title'],
            ['key' => 'seo_meta_description', 'value' => 'Sanggar Tari Ngesti Laras Budaya di Meteseh, Boja, Kendal. Melestarikan seni tari tradisional Nusantara melalui latihan rutin dan penampilan berkualitas.', 'type' => 'textarea', 'group' => 'seo', 'description' => 'Default meta description'],
            ['key' => 'seo_meta_keywords', 'value' => 'ngesti laras budaya, ngelaras, sanggar tari, meteseh, boja, kendal, tari tradisional, seni budaya, sanggar tari kendal', 'type' => 'textarea', 'group' => 'seo', 'description' => 'Default meta keywords'],
            ['key' => 'seo_og_image', 'value' => null, 'type' => 'image', 'group' => 'seo', 'description' => 'Default Open Graph image'],

            // Homepage Settings
            ['key' => 'home_hero_title', 'value' => 'Pelestari Seni Tari Tradisional Nusantara', 'type' => 'text', 'group' => 'homepage', 'description' => 'Hero section title'],
            ['key' => 'home_hero_subtitle', 'value' => 'Menjaga Budaya Leluhur Melalui Gerak dan Irama', 'type' => 'textarea', 'group' => 'homepage', 'description' => 'Hero section subtitle'],
            ['key' => 'home_hero_cta_text', 'value' => 'Bergabung Sekarang', 'type' => 'text', 'group' => 'homepage', 'description' => 'Hero CTA button text'],
            ['key' => 'home_hero_cta_link', 'value' => '#', 'type' => 'text', 'group' => 'homepage', 'description' => 'Hero CTA button link'],
            ['key' => 'home_hero_image', 'value' => null, 'type' => 'image', 'group' => 'homepage', 'description' => 'Hero section background image'],
            ['key' => 'home_about_short', 'value' => 'Selamat datang di Sanggar Tari Ngesti Laras Budaya. Kami adalah sanggar tari yang berkomitmen untuk melestarikan dan mengembangkan seni tari tradisional Nusantara.', 'type' => 'textarea', 'group' => 'homepage', 'description' => 'About us (short version untuk homepage)'],
            ['key' => 'footer_description', 'value' => 'Sanggar Tari Ngesti Laras Budaya berkomitmen untuk melestarikan dan mengembangkan seni tari tradisional Nusantara sejak 2010.', 'type' => 'textarea', 'group' => 'general', 'description' => 'Footer description'],
        ];

        foreach ($settings as $setting) {
            DB::table('site_settings')->updateOrInsert(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'type' => $setting['type'],
                    'group' => $setting['group'],
                    'description' => $setting['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // Seed Pages with default structure
        $pages = [
            [
                'page_key' => 'homepage',
                'title' => 'Beranda',
                'sections' => json_encode([
                    'hero' => [
                        'title' => 'Ngesti Laras Budaya',
                        'subtitle' => 'Pelestarian dan Pengembangan Seni Budaya Tradisional',
                        'image' => '',
                    ],
                    'about' => [
                        'title' => 'Tentang Kami',
                        'content' => 'Selamat datang di Sanggar Tari Ngesti Laras Budaya. Kami adalah sanggar tari yang berkomitmen untuk melestarikan dan mengembangkan seni tari tradisional Jawa dan budaya nusantara. Didirikan sejak tahun 2010, kami telah membina ratusan siswa dalam seni tari tradisional, gamelan, dan kesenian lainnya.',
                    ],
                    'stats' => [
                        'show_students' => true,
                        'show_events' => true,
                    ],
                ]),
                'meta_title' => 'Ngesti Laras Budaya - Sanggar Tari Tradisional Kendal',
                'meta_description' => 'Sanggar Tari Ngesti Laras Budaya di Meteseh, Boja, Kendal. Melestarikan seni tari tradisional Jawa dan budaya nusantara.',
                'meta_keywords' => 'ngesti laras budaya, ngelaras, sanggar tari kendal, tari tradisional, meteseh, boja',
            ],
            [
                'page_key' => 'about',
                'title' => 'Tentang Kami',
                'sections' => json_encode([
                    'hero' => [
                        'title' => 'Tentang Kami',
                        'description' => 'Mengenal lebih dekat Sanggar Tari Ngesti Laras Budaya',
                        'image' => '',
                    ],
                    'visi' => 'Menjadi sanggar tari terdepan dalam pelestarian dan pengembangan seni budaya tradisional Nusantara yang berkualitas dan berprestasi.',
                    'misi' => [
                        'Melestarikan dan mengembangkan seni tari tradisional Jawa dan budaya nusantara',
                        'Membina generasi muda untuk mencintai dan melestarikan budaya leluhur',
                        'Meningkatkan kualitas seni pertunjukan melalui latihan rutin dan pembinaan yang terstruktur',
                        'Aktif mengikuti kompetisi dan festival budaya di tingkat lokal dan nasional',
                        'Membangun kerjasama dengan berbagai pihak untuk pengembangan seni budaya',
                    ],
                    'history' => 'Sanggar Tari Ngesti Laras Budaya didirikan pada tahun 2010 di Meteseh, Boja, Kendal, Jawa Tengah. Berawal dari kecintaan para pendiri terhadap seni tari tradisional, sanggar ini terus berkembang dan kini telah membina ratusan siswa dari berbagai kalangan usia. Dengan bimbingan instruktur yang berpengalaman, sanggar ini telah menghasilkan banyak penari berbakat yang aktif tampil di berbagai acara budaya.',
                ]),
                'meta_title' => 'Tentang Kami - Ngesti Laras Budaya',
                'meta_description' => 'Sejarah, visi, dan misi Sanggar Tari Ngesti Laras Budaya di Meteseh, Boja, Kendal.',
                'meta_keywords' => 'tentang ngesti laras budaya, sejarah ngelaras, visi misi sanggar tari',
            ],
            [
                'page_key' => 'contact',
                'title' => 'Kontak Kami',
                'sections' => json_encode([
                    'title' => 'Hubungi Kami',
                    'subtitle' => 'Jangan ragu untuk menghubungi kami jika ada pertanyaan atau ingin bergabung dengan sanggar kami',
                    'address' => 'Meteseh, Boja, Kendal, Jawa Tengah',
                    'map_embed' => '',
                ]),
                'meta_title' => 'Kontak Kami - Ngesti Laras Budaya',
                'meta_description' => 'Hubungi Sanggar Tari Ngesti Laras Budaya untuk informasi lebih lanjut.',
                'meta_keywords' => 'kontak ngelaras, hubungi sanggar tari kendal, alamat ngelaras',
            ],
        ];

        foreach ($pages as $page) {
            DB::table('pages')->updateOrInsert(
                ['page_key' => $page['page_key']],
                [
                    'title' => $page['title'],
                    'sections' => $page['sections'],
                    'meta_title' => $page['meta_title'],
                    'meta_description' => $page['meta_description'],
                    'meta_keywords' => $page['meta_keywords'],
                    'updated_by' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // Seed Social Links
        $socialLinks = [
            ['platform' => 'instagram', 'url' => 'https://instagram.com/ngestilarasbudaya', 'order' => 1, 'is_active' => true],
            ['platform' => 'facebook', 'url' => 'https://facebook.com/ngestilarasbudaya', 'order' => 2, 'is_active' => true],
            ['platform' => 'youtube', 'url' => 'https://youtube.com/@ngestilarasbudaya', 'order' => 3, 'is_active' => true],
            ['platform' => 'tiktok', 'url' => 'https://tiktok.com/@ngestilarasbudaya', 'order' => 4, 'is_active' => false],
            ['platform' => 'whatsapp', 'url' => 'https://wa.me/62xxx', 'order' => 5, 'is_active' => true],
        ];

        foreach ($socialLinks as $link) {
            DB::table('social_links')->updateOrInsert(
                ['platform' => $link['platform']],
                [
                    'url' => $link['url'],
                    'order' => $link['order'],
                    'is_active' => $link['is_active'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // Get admin user ID for sample data
        $adminUser = DB::table('users')->where('email', 'admin@example.com')->orWhere('role', 'admin')->first();
        $userId = $adminUser ? $adminUser->id : 1;

        // Seed Sample Posts
        $posts = [
            [
                'title' => 'Selamat Datang di Sanggar Tari Ngesti Laras Budaya',
                'slug' => 'selamat-datang-di-sanggar-tari-ngesti-laras-budaya',
                'excerpt' => 'Perkenalan singkat tentang Sanggar Tari Ngesti Laras Budaya dan kegiatan kami dalam melestarikan seni tari tradisional Nusantara.',
                'content' => '<p>Selamat datang di website resmi Sanggar Tari Ngesti Laras Budaya! Kami adalah sanggar tari yang berkomitmen untuk melestarikan dan mengembangkan seni tari tradisional Jawa dan budaya nusantara.</p><p>Didirikan sejak tahun 2010 di Meteseh, Boja, Kendal, Jawa Tengah, kami telah membina ratusan siswa dari berbagai kalangan usia dalam seni tari tradisional, gamelan, dan kesenian lainnya.</p><p>Melalui latihan rutin setiap hari Minggu dan pembinaan yang terstruktur, kami terus berupaya meningkatkan kualitas seni pertunjukan dan membentuk generasi muda yang mencintai budaya leluhur.</p>',
                'featured_image' => '',
                'category_id' => DB::table('post_categories')->where('slug', 'pengumuman')->value('id'),
                'author_id' => $userId,
                'status' => 'published',
                'published_at' => now(),
                'meta_title' => 'Selamat Datang di Sanggar Tari Ngesti Laras Budaya',
                'meta_description' => 'Perkenalan Sanggar Tari Ngesti Laras Budaya - Pelestari Seni Tari Tradisional Nusantara',
            ],
            [
                'title' => 'Jadwal Latihan Rutin Sanggar Tari',
                'slug' => 'jadwal-latihan-rutin-sanggar-tari',
                'excerpt' => 'Informasi jadwal latihan rutin Sanggar Tari Ngesti Laras Budaya setiap hari Minggu.',
                'content' => '<p>Latihan rutin Sanggar Tari Ngesti Laras Budaya dilaksanakan setiap hari <strong>Minggu</strong> mulai pukul <strong>08.00 - 12.00 WIB</strong>.</p><p>Adapun pembagian jadwal latihan berdasarkan kelompok usia:</p><ul><li>Kelompok Anak-anak (5-12 tahun): 08.00 - 09.30</li><li>Kelompok Remaja (13-17 tahun): 09.30 - 11.00</li><li>Kelompok Dewasa (18+ tahun): 11.00 - 12.00</li></ul><p>Untuk informasi lebih lanjut, silakan hubungi kontak yang tersedia.</p>',
                'featured_image' => '',
                'category_id' => DB::table('post_categories')->where('slug', 'latihan')->value('id'),
                'author_id' => $userId,
                'status' => 'published',
                'published_at' => now()->subDays(2),
                'meta_title' => 'Jadwal Latihan Rutin - Ngesti Laras Budaya',
                'meta_description' => 'Jadwal latihan rutin Sanggar Tari Ngesti Laras Budaya setiap hari Minggu',
            ],
            [
                'title' => 'Persiapan Ujian Kenaikan Tingkat 2026',
                'slug' => 'persiapan-ujian-kenaikan-tingkat-2026',
                'excerpt' => 'Pengumuman persiapan ujian kenaikan tingkat untuk seluruh siswa sanggar tahun 2026.',
                'content' => '<p>Dalam rangka meningkatkan kemampuan dan kompetensi para siswa, Sanggar Tari Ngesti Laras Budaya akan mengadakan <strong>Ujian Kenaikan Tingkat</strong> pada pertengahan tahun 2026.</p><p>Ujian ini wajib diikuti oleh seluruh siswa yang telah mengikuti latihan minimal 6 bulan. Materi ujian meliputi:</p><ul><li>Tari Klasik Jawa</li><li>Tari Kreasi Baru</li><li>Pengetahuan Budaya</li><li>Etika dan Tatakrama</li></ul><p>Persiapan ujian akan dimulai pada bulan ini dengan latihan intensif setiap hari Minggu. Informasi lebih detail akan disampaikan pada saat latihan.</p>',
                'featured_image' => '',
                'category_id' => DB::table('post_categories')->where('slug', 'ujian')->value('id'),
                'author_id' => $userId,
                'status' => 'published',
                'published_at' => now()->subDays(5),
                'meta_title' => 'Persiapan Ujian Kenaikan Tingkat 2026',
                'meta_description' => 'Informasi ujian kenaikan tingkat Sanggar Tari Ngesti Laras Budaya tahun 2026',
            ],
        ];

        foreach ($posts as $post) {
            DB::table('posts')->updateOrInsert(
                ['slug' => $post['slug']],
                [
                    'title' => $post['title'],
                    'excerpt' => $post['excerpt'],
                    'content' => $post['content'],
                    'featured_image' => $post['featured_image'],
                    'category_id' => $post['category_id'],
                    'author_id' => $post['author_id'],
                    'status' => $post['status'],
                    'published_at' => $post['published_at'],
                    'meta_title' => $post['meta_title'],
                    'meta_description' => $post['meta_description'],
                    'created_at' => $post['published_at'],
                    'updated_at' => $post['published_at'],
                ]
            );
        }

        // Seed Sample Events
        $events = [
            [
                'title' => 'Latihan Rutin Minggu',
                'description' => 'Latihan rutin tari tradisional untuk semua kelompok usia',
                'start_date' => now()->next('Sunday')->setTime(8, 0),
                'end_date' => now()->next('Sunday')->setTime(12, 0),
                'location' => 'Sanggar Ngesti Laras Budaya, Meteseh, Boja',
                'event_type' => 'latihan',
                'color' => '#10b981',
                'created_by' => $userId,
            ],
            [
                'title' => 'Peringatan Hari Kartini',
                'description' => 'Pentas tari memperingati Hari Kartini dengan menampilkan tarian tradisional Jawa',
                'start_date' => now()->setDate(2026, 4, 21)->setTime(14, 0),
                'end_date' => now()->setDate(2026, 4, 21)->setTime(17, 0),
                'location' => 'Pendopo Kabupaten Kendal',
                'event_type' => 'pentas',
                'color' => '#8b5cf6',
                'created_by' => $userId,
            ],
            [
                'title' => 'Ujian Kenaikan Tingkat Semester 1',
                'description' => 'Ujian kenaikan tingkat untuk seluruh siswa sanggar semester pertama tahun 2026',
                'start_date' => now()->setDate(2026, 6, 15)->setTime(8, 0),
                'end_date' => now()->setDate(2026, 6, 15)->setTime(16, 0),
                'location' => 'Sanggar Ngesti Laras Budaya',
                'event_type' => 'ujian',
                'color' => '#f59e0b',
                'created_by' => $userId,
            ],
            [
                'title' => 'Festival Seni Budaya Jawa Tengah',
                'description' => 'Partisipasi dalam Festival Seni Budaya Jawa Tengah tingkat provinsi',
                'start_date' => now()->setDate(2026, 8, 10)->setTime(9, 0),
                'end_date' => now()->setDate(2026, 8, 12)->setTime(18, 0),
                'location' => 'Gedung Kesenian Semarang',
                'event_type' => 'pentas',
                'color' => '#8b5cf6',
                'created_by' => $userId,
            ],
        ];

        foreach ($events as $event) {
            DB::table('events')->insert([
                'title' => $event['title'],
                'description' => $event['description'],
                'start_date' => $event['start_date'],
                'end_date' => $event['end_date'],
                'location' => $event['location'],
                'event_type' => $event['event_type'],
                'color' => $event['color'],
                'is_cancelled' => false,
                'created_by' => $event['created_by'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('CMS data seeded successfully!');
    }
}
