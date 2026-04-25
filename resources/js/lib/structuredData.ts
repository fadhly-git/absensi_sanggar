interface OrganizationData {
  name: string;
  url: string;
  logo: string;
  description: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  socialLinks?: string[];
  foundingDate?: string;
}

interface LocalBusinessData extends OrganizationData {
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  openingHours?: string[];
}

interface ArticleData {
  headline?: string;
  title?: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string | {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo: string;
  };
  url?: string;
  section?: string;
  tags?: string[];
}

interface EventData {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address: string;
  };
  image?: string;
  url?: string;
  organizer: {
    name: string;
    url: string;
  };
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed';
  eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

const defaultOrganizationData: OrganizationData = {
  name: 'Sanggar Tari Ngesti Laras Budaya',
  url: 'https://ngelaras.my.id',
  logo: 'https://ngelaras.my.id/img/logo.png',
  description: 'Sanggar tari tradisional Ngesti Laras Budaya di Meteseh, Boja, Kendal. Pelestarian dan pengembangan seni tari Jawa dan budaya nusantara.',
};

export const generateOrganizationSchema = (data: Partial<OrganizationData> = {}) => {
  const merged = { ...defaultOrganizationData, ...data };
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: merged.name,
    url: merged.url,
    logo: merged.logo,
    description: merged.description,
    ...(merged.email && { email: merged.email }),
    ...(merged.phone && { telephone: merged.phone }),
    ...(merged.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: merged.address.street,
        addressLocality: merged.address.city,
        addressRegion: merged.address.state,
        postalCode: merged.address.postalCode,
        addressCountry: merged.address.country,
      },
    }),
    ...(merged.socialLinks && { sameAs: merged.socialLinks }),
    ...(merged.foundingDate && { foundingDate: merged.foundingDate }),
  };
};

const defaultLocalBusinessData: LocalBusinessData = {
  name: 'Sanggar Tari Ngesti Laras Budaya',
  url: 'https://ngelaras.my.id',
  logo: 'https://ngelaras.my.id/img/logo.png',
  description: 'Sanggar tari tradisional Ngesti Laras Budaya di Meteseh, Boja, Kendal. Kursus tari Jawa, gamelan, dan seni budaya nusantara.',
  latitude: -7.0000,
  longitude: 110.0000,
  priceRange: '$$',
  address: {
    street: 'Meteseh',
    city: 'Boja',
    state: 'Kendal',
    postalCode: '51381',
    country: 'ID',
  },
};

export const generateLocalBusinessSchema = (data: Partial<LocalBusinessData> = {}) => {
  const merged = { ...defaultLocalBusinessData, ...data };
  return {
    '@context': 'https://schema.org',
    '@type': 'DanceSchool',
    '@id': merged.url,
    name: merged.name,
    description: merged.description,
    url: merged.url,
    logo: merged.logo,
    image: merged.logo,
    ...(merged.email && { email: merged.email }),
    ...(merged.phone && { telephone: merged.phone }),
    ...(merged.priceRange && { priceRange: merged.priceRange }),
    ...(merged.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: merged.address.street,
        addressLocality: merged.address.city,
        addressRegion: merged.address.state,
        postalCode: merged.address.postalCode,
        addressCountry: merged.address.country,
      },
    }),
    ...(merged.latitude &&
      merged.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: merged.latitude,
        longitude: merged.longitude,
      },
    }),
    ...(merged.openingHours && { openingHoursSpecification: merged.openingHours }),
    ...(merged.socialLinks && { sameAs: merged.socialLinks }),
    areaServed: {
      '@type': 'City',
      name: 'Kendal',
      containedIn: {
        '@type': 'State',
        name: 'Jawa Tengah',
      },
    },
  };
};

export const generateArticleSchema = (data: ArticleData) => {
  const headline = data.headline || data.title || 'Article';
  const author = typeof data.author === 'string'
    ? { name: data.author }
    : (data.author || { name: 'Ngesti Laras Budaya' });
  const publisher = data.publisher || {
    name: 'Sanggar Tari Ngesti Laras Budaya',
    logo: 'https://ngelaras.my.id/img/logo.png',
  };
  const url = data.url || 'https://ngelaras.my.id';

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description: data.description,
    ...(data.image && { image: data.image }),
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    author: {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
    },
    publisher: {
      '@type': 'Organization',
      name: publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: publisher.logo,
      },
    },
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(data.section && { articleSection: data.section }),
    ...(data.tags && data.tags.length > 0 && { keywords: data.tags.join(', ') }),
  };
};

export const generateEventSchema = (data: EventData) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: data.name,
  description: data.description,
  startDate: data.startDate,
  ...(data.endDate && { endDate: data.endDate }),
  ...(data.image && { image: data.image }),
  location: {
    '@type': 'Place',
    name: data.location.name,
    address: {
      '@type': 'PostalAddress',
      name: data.location.address,
    },
  },
  organizer: {
    '@type': 'Organization',
    name: data.organizer.name,
    url: data.organizer.url,
  },
  eventStatus: `https://schema.org/${data.eventStatus || 'EventScheduled'}`,
  eventAttendanceMode: `https://schema.org/${data.eventAttendanceMode || 'OfflineEventAttendanceMode'}`,
  ...(data.url && { url: data.url }),
});

export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

const defaultWebSiteData = {
  name: 'Sanggar Tari Ngesti Laras Budaya',
  url: 'https://ngelaras.my.id',
  description: 'Website resmi Sanggar Tari Ngesti Laras Budaya - Pelestarian seni tari tradisional Jawa dan budaya nusantara di Kendal',
};

export const generateWebSiteSchema = (data: Partial<{ name: string; url: string; description: string }> = {}) => {
  const merged = { ...defaultWebSiteData, ...data };
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: merged.name,
    url: merged.url,
    description: merged.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${merged.url}/news?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
};
