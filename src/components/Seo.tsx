import { Helmet } from "react-helmet-async";
import { defaultOgImage, siteName, siteUrl } from "../data/seo";
import type { SeoConfig } from "../types";

interface SeoProps {
  config: SeoConfig;
}

function absoluteUrl(path = defaultOgImage) {
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function Seo({ config }: SeoProps) {
  const canonical = `${siteUrl}${config.canonicalPath}`;
  const image = absoluteUrl(config.ogImage);
  const jsonLd = Array.isArray(config.jsonLd) ? config.jsonLd : config.jsonLd ? [config.jsonLd] : [];

  return (
    <Helmet>
      <title>{config.title}</title>
      <meta name="description" content={config.description} />
      {config.keywords?.length ? <meta name="keywords" content={config.keywords.join(", ")} /> : null}
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={config.title} />
      <meta name="twitter:description" content={config.description} />
      <meta name="twitter:image" content={image} />
      {jsonLd.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
