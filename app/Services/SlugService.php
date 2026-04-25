<?php

namespace App\Services;

class SlugService
{
    private const LOCATION_KEYWORDS = ['meteseh', 'boja', 'kendal'];
    private const BRAND_KEYWORDS = ['ngelaras', 'ngesti', 'laras'];
    private const DANCE_KEYWORDS = ['tari', 'pentas', 'sanggar', 'budaya', 'seni'];

    /**
     * Generate SEO-optimized slug from title
     */
    public static function generateSEOSlug(
        string $title,
        int $maxLength = 60,
        bool $injectLocation = true,
        bool $injectBrand = true,
        ?int $year = null
    ): string {
        // Step 1: Clean and normalize
        $slug = self::cleanString($title);
        $slugParts = explode('-', $slug);
        $slugLower = strtolower($slug);

        // Step 2: Inject brand keyword if not present
        if ($injectBrand && !self::containsAny($slugLower, self::BRAND_KEYWORDS)) {
            if (self::containsAny($slugLower, self::DANCE_KEYWORDS) && count($slugParts) < 8) {
                array_splice($slugParts, 2, 0, ['ngelaras']);
            }
        }

        // Step 3: Inject location keyword if not present
        if ($injectLocation && !self::containsAny($slugLower, self::LOCATION_KEYWORDS)) {
            $slugParts[] = 'kendal';
        }

        // Step 4: Add year if provided
        if ($year && !str_contains($slugLower, (string) $year)) {
            $slugParts[] = (string) $year;
        }

        // Step 5: Join and trim to max length
        $finalSlug = implode('-', $slugParts);

        if (strlen($finalSlug) > $maxLength) {
            $words = explode('-', $finalSlug);
            while (strlen(implode('-', $words)) > $maxLength && count($words) > 3) {
                $middleIndex = (int) floor(count($words) / 2);
                array_splice($words, $middleIndex, 1);
            }
            $finalSlug = implode('-', $words);
        }

        // Final cleanup
        $finalSlug = trim($finalSlug, '-');
        $finalSlug = substr($finalSlug, 0, $maxLength);

        return $finalSlug;
    }

    /**
     * Clean string for slug
     */
    private static function cleanString(string $string): string
    {
        $string = strtolower(trim($string));

        // Remove special characters
        $string = preg_replace('/[^\w\s-]/u', '', $string);

        // Replace multiple spaces with single space
        $string = preg_replace('/\s+/', ' ', $string);

        // Replace spaces with hyphens
        $string = str_replace(' ', '-', $string);

        // Remove multiple hyphens
        $string = preg_replace('/-+/', '-', $string);

        return $string;
    }

    /**
     * Check if string contains any of the keywords
     */
    private static function containsAny(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (str_contains($haystack, $needle)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate keywords from title and content
     */
    public static function generateKeywords(
        string $title,
        ?string $content = null,
        ?string $category = null
    ): string {
        $keywords = [
            'ngesti laras budaya',
            'ngelaras',
            'sanggar tari kendal',
            'meteseh boja',
            'tari tradisional',
            'seni budaya jawa',
        ];

        // Extract from title
        $titleWords = array_filter(
            explode(' ', strtolower($title)),
            fn($word) => strlen($word) > 3
        );
        $keywords = array_merge($keywords, $titleWords);

        // Add category
        if ($category) {
            $keywords[] = strtolower($category);
        }

        // Extract from content
        if ($content) {
            $danceTerms = [
                'tari jawa',
                'tari klasik',
                'tari kreasi',
                'gamelan',
                'wayang',
                'batik',
                'pentas seni',
                'budaya nusantara',
            ];

            $contentLower = strtolower($content);
            foreach ($danceTerms as $term) {
                if (str_contains($contentLower, $term)) {
                    $keywords[] = $term;
                }
            }
        }

        return implode(', ', array_unique(array_slice($keywords, 0, 20)));
    }

    /**
     * Generate meta description from content
     */
    public static function generateMetaDescription(string $content, int $maxLength = 160): string
    {
        // Remove HTML tags
        $text = strip_tags($content);

        // Get first maxLength characters
        $description = substr($text, 0, $maxLength);

        // Try to end at sentence
        $lastPeriod = strrpos($description, '.');
        $lastExclamation = strrpos($description, '!');
        $lastQuestion = strrpos($description, '?');
        $lastSentenceEnd = max($lastPeriod ?: 0, $lastExclamation ?: 0, $lastQuestion ?: 0);

        if ($lastSentenceEnd > $maxLength * 0.6) {
            $description = substr($description, 0, $lastSentenceEnd + 1);
        } else {
            $lastSpace = strrpos($description, ' ');
            if ($lastSpace > $maxLength * 0.8) {
                $description = substr($description, 0, $lastSpace) . '...';
            }
        }

        return trim($description);
    }
}
