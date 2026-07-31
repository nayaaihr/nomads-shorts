// JSON-LD structured data. Google reads this to build rich snippets:
// price, description, ratings (once we have real reviews), etc.
// See https://schema.org/SoftwareApplication.

const SITE = "https://www.nomadsshorts.com";

const softwareApplication = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Nomads Shorts",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (web)",
  url: SITE,
  description:
    "AI web app that turns long-form YouTube travel vlogs into 5-10 vertical short clips ready to post on Reels, YouTube Shorts, and TikTok.",
  offers: [
    {
      "@type": "Offer",
      name: "Starter — 60 credits",
      price: "9",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Creator — 300 credits",
      price: "39",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Pro — 900 credits",
      price: "99",
      priceCurrency: "USD",
    },
  ],
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nomads Shorts",
  url: SITE,
  logo: `${SITE}/icon.svg`,
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "info@nomadsshorts.com",
      contactType: "customer support",
    },
  ],
  founder: {
    "@type": "Person",
    name: "Charu Tripathi",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Zurich",
    addressCountry: "CH",
  },
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Nomads Shorts",
  url: SITE,
};

// Two blobs on the landing page: one for the app, one for the org.
export function LandingJsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify is safe; no user-generated data in these payloads.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
