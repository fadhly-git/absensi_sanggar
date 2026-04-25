/**
 * Generate SEO-friendly slug from title with keyword injection
 *
 * Strategy:
 * 1. Clean and normalize title
 * 2. Inject location keywords (meteseh, boja, kendal) if not present
 * 3. Inject brand keywords (ngelaras) strategically
 * 4. Limit to 60 characters for optimal SEO
 */

const LOCATION_KEYWORDS = ['meteseh', 'boja', 'kendal'];
const BRAND_KEYWORDS = ['ngelaras', 'ngesti laras'];
const DANCE_KEYWORDS = ['tari', 'pentas', 'sanggar', 'budaya'];

interface SlugOptions {
  maxLength?: number;
  injectLocation?: boolean;
  injectBrand?: boolean;
  year?: number;
}

export function generateSEOSlug(
  title: string,
  options: SlugOptions = {}
): string {
  const {
    maxLength = 60,
    injectLocation = true,
    injectBrand = true,
    year,
  } = options;

  // Step 1: Clean and normalize
  const slug = title
    .toLowerCase()
    .trim()
    // Remove special characters except spaces and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Replace spaces with hyphens
    .replace(/\s/g, '-')
    // Remove multiple hyphens
    .replace(/-+/g, '-');

  const slugParts = slug.split('-');
  const slugLower = slug.toLowerCase();

  // Step 2: Inject brand keyword if not present and option enabled
  if (injectBrand && !BRAND_KEYWORDS.some((kw) => slugLower.includes(kw))) {
    // If it's a dance/performance related post, add ngelaras
    if (
      DANCE_KEYWORDS.some((kw) => slugLower.includes(kw)) &&
      slugParts.length < 8
    ) {
      slugParts.splice(2, 0, 'ngelaras'); // Insert after first 2 words
    }
  }

  // Step 3: Inject location keyword if not present and option enabled
  if (injectLocation && !LOCATION_KEYWORDS.some((kw) => slugLower.includes(kw))) {
    // Add location at the end before year
    const locationToAdd = 'kendal'; // Default to main location
    slugParts.push(locationToAdd);
  }

  // Step 4: Add year if provided and not present
  if (year && !slugLower.includes(year.toString())) {
    slugParts.push(year.toString());
  }

  // Step 5: Join and trim to max length
  let finalSlug = slugParts.join('-');

  if (finalSlug.length > maxLength) {
    // Trim from the middle, keeping important start and end
    const words = finalSlug.split('-');
    while (words.join('-').length > maxLength && words.length > 3) {
      // Remove from middle
      const middleIndex = Math.floor(words.length / 2);
      words.splice(middleIndex, 1);
    }
    finalSlug = words.join('-');
  }

  // Final cleanup
  finalSlug = finalSlug
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, maxLength);

  return finalSlug;
}

/**
 * Generate keywords array from title and content
 */
export function generateKeywords(
  title: string,
  content?: string,
  category?: string
): string {
  const keywords = new Set<string>();

  // Always include core keywords
  keywords.add('ngesti laras budaya');
  keywords.add('ngelaras');
  keywords.add('sanggar tari kendal');
  keywords.add('meteseh boja');
  keywords.add('tari tradisional');
  keywords.add('seni budaya jawa');

  // Extract from title
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3);
  titleWords.forEach((word) => keywords.add(word));

  // Add category-specific keywords
  if (category) {
    keywords.add(category.toLowerCase());
  }

  // Extract important phrases from content (if provided)
  if (content) {
    const contentLower = content.toLowerCase();

    // Look for dance-related terms
    const danceTerms = [
      'tari jawa',
      'tari klasik',
      'tari kreasi',
      'gamelan',
      'wayang',
      'batik',
      'pentas seni',
      'budaya nusantara',
    ];

    danceTerms.forEach((term) => {
      if (contentLower.includes(term)) {
        keywords.add(term);
      }
    });
  }

  return Array.from(keywords).slice(0, 20).join(', ');
}

/**
 * Generate meta description from content
 */
export function generateMetaDescription(
  content: string,
  maxLength: number = 160
): string {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');

  // Get first sentence or maxLength characters
  let description = text.substring(0, maxLength);

  // Try to end at sentence
  const lastPeriod = description.lastIndexOf('.');
  const lastExclamation = description.lastIndexOf('!');
  const lastQuestion = description.lastIndexOf('?');
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

  if (lastSentenceEnd > maxLength * 0.6) {
    description = description.substring(0, lastSentenceEnd + 1);
  } else {
    // End at last space to avoid cutting words
    const lastSpace = description.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      description = description.substring(0, lastSpace) + '...';
    }
  }

  return description.trim();
}

/**
 * Optimize image alt text for SEO
 */
export function generateImageAlt(
  imageContext: string,
  title?: string
): string {
  const parts: string[] = [];

  if (title) {
    parts.push(title);
  }

  parts.push(imageContext);
  parts.push('Ngesti Laras Budaya');

  // Add location for local SEO
  if (!imageContext.toLowerCase().includes('kendal')) {
    parts.push('Kendal');
  }

  return parts.join(' - ');
}
