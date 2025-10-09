import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import { getBaseUrl, getCanonicalUrl } from 'constants/seo';

const arrayToContent = (value) => {
  if (!value) {
    return '';
  }

  return Array.isArray(value) ? value.filter(Boolean).join(', ') : value;
};

const ensureArray = (value) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const SeoHelmet = ({
  title,
  description,
  keywords,
  robots = 'index,follow',
  openGraph = {},
  twitter = {},
  structuredData,
  pathname = '/'
}) => {
  const canonicalUrl = getCanonicalUrl(pathname);
  const baseUrl = getBaseUrl();
  const keywordContent = arrayToContent(keywords);

  const ogTitle = openGraph.title || title;
  const ogDescription = openGraph.description || description;
  const ogImage = openGraph.image;
  const ogType = openGraph.type || 'website';
  const ogSiteName = openGraph.siteName || openGraph.site_name || 'Chirou API';

  const twitterTitle = twitter.title || title;
  const twitterDescription = twitter.description || description;
  const twitterImage = twitter.image || ogImage;
  const twitterCard = twitter.card || 'summary_large_image';

  const structuredItems = ensureArray(structuredData);

  return (
    <Helmet prioritizeSeoTags>
      {title && <title>{title}</title>}

      {description && <meta name="description" content={description} />}
      {keywordContent && <meta name="keywords" content={keywordContent} />}
      {robots && <meta name="robots" content={robots} />}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:site_name" content={ogSiteName} />

      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogType && <meta property="og:type" content={ogType} />}

      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      {twitterTitle && <meta name="twitter:title" content={twitterTitle} />}
      {twitterDescription && <meta name="twitter:description" content={twitterDescription} />}
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}

      {baseUrl && <meta name="twitter:domain" content={baseUrl.replace(/^https?:\/\//, '')} />}

      {structuredItems.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
};

SeoHelmet.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
  robots: PropTypes.string,
  openGraph: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    type: PropTypes.string,
    siteName: PropTypes.string,
    site_name: PropTypes.string
  }),
  twitter: PropTypes.shape({
    card: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string
  }),
  structuredData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  pathname: PropTypes.string
};

export default SeoHelmet;
