<?php

namespace App\Http\Controllers\SEO;

use App\Http\Controllers\Controller;

class RobotsController extends Controller
{
    /**
     * Generate robots.txt
     */
    public function index()
    {
        $baseUrl = config('app.url');
        $isProduction = app()->environment('production');

        $content = '';

        if ($isProduction) {
            // Production: Allow all
            $content .= "User-agent: *\n";
            $content .= "Allow: /\n\n";

            // Disallow admin and api endpoints
            $content .= "Disallow: /atmin/\n";
            $content .= "Disallow: /api/\n";
            $content .= "Disallow: /login\n";
            $content .= "Disallow: /register\n\n";

            // Sitemap location
            $content .= "Sitemap: {$baseUrl}/sitemap.xml\n";
        } else {
            // Development/Staging: Block all
            $content .= "User-agent: *\n";
            $content .= "Disallow: /\n";
        }

        return response($content, 200, [
            'Content-Type' => 'text/plain',
            'Cache-Control' => 'public, max-age=86400', // Cache for 24 hours
        ]);
    }
}
