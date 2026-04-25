<?php

namespace App\Http\Controllers\SEO;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\GalleryItem;
use App\Models\Event;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate XML sitemap
     */
    public function index()
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        $baseUrl = config('app.url');

        // Homepage - Highest priority
        $xml .= $this->addUrl($baseUrl, now(), '1.0', 'daily');

        // Static pages
        $staticPages = [
            ['url' => '/about-us', 'priority' => '0.9', 'changefreq' => 'monthly'],
            ['url' => '/gallery', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['url' => '/news', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['url' => '/contact', 'priority' => '0.7', 'changefreq' => 'monthly'],
        ];

        foreach ($staticPages as $page) {
            $xml .= $this->addUrl(
                $baseUrl . $page['url'],
                now(),
                $page['priority'],
                $page['changefreq']
            );
        }

        // Blog posts
        $posts = Post::published()
            ->select('slug', 'updated_at')
            ->orderBy('published_at', 'desc')
            ->get();

        foreach ($posts as $post) {
            $xml .= $this->addUrl(
                $baseUrl . '/news/' . $post->slug,
                $post->updated_at,
                '0.8',
                'weekly'
            );
        }

        // Gallery items
        $galleries = GalleryItem::where('status', 'approved')
            ->select('id', 'updated_at')
            ->get();

        foreach ($galleries as $gallery) {
            $xml .= $this->addUrl(
                $baseUrl . '/gallery#' . $gallery->id,
                $gallery->updated_at,
                '0.6',
                'monthly'
            );
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Cache-Control' => 'public, max-age=3600', // Cache for 1 hour
        ]);
    }

    /**
     * Add URL entry to sitemap
     */
    private function addUrl(
        string $url,
        $lastmod,
        string $priority = '0.5',
        string $changefreq = 'monthly'
    ): string {
        $lastmodFormatted = $lastmod instanceof \DateTime
            ? $lastmod->format('Y-m-d')
            : now()->format('Y-m-d');

        return sprintf(
            '<url><loc>%s</loc><lastmod>%s</lastmod><changefreq>%s</changefreq><priority>%s</priority></url>',
            htmlspecialchars($url),
            $lastmodFormatted,
            $changefreq,
            $priority
        );
    }
}
