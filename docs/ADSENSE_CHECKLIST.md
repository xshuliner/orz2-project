# Google AdSense Checklist

This project is prepared for Google AdSense with a production-only publisher
configuration.

## Current Configuration

- Publisher ID: `pub-1170288004693232`
- AdSense client: `ca-pub-1170288004693232`
- Production env: `.env.prod`
- Root ads.txt: `public/ads.txt`
- Privacy page: `/privacy`, `/en/privacy`, `/ja/privacy`

Development and UAT leave `VITE_GOOGLE_ADSENSE_CLIENT` empty, so the AdSense
script does not load outside production builds.

## Google Requirements And Recommendations Checked

- Site review: AdSense reviews the whole site for compliance before ads can
  serve. Approval can take a few days, and sometimes 2-4 weeks.
- Site connection: place the AdSense code or meta tag in the document head, or
  publish the ads.txt snippet at the site root.
- Content quality: pages should provide unique, relevant content and a good user
  experience.
- Navigation: the site should have clear, readable, functioning navigation.
- Ad behavior: do not encourage ad clicks, disguise ads as content/navigation, or
  place ads on pop-ups, emails, non-content pages, or pages made only for ads.
- Privacy: disclose Google and third-party advertising cookies, ad
  personalization, web beacons or similar technologies, and opt-out paths.
- Consent: for EEA, UK, and Switzerland users, configure Google CMP or a
  certified third-party CMP before serving personalized ads where consent is
  required.

## Release Checklist

1. Confirm the live production page source contains:
   `<meta name="google-adsense-account" content="ca-pub-1170288004693232">`
2. Confirm the live production page source loads:
   `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1170288004693232`
3. Confirm `https://orz2.online/ads.txt` returns:
   `google.com, pub-1170288004693232, DIRECT, f08c47fec0942fa0`
4. In AdSense, add `https://orz2.online` as the site, verify the connection,
   then request review.
5. In AdSense Privacy & messaging, choose Google CMP or a certified third-party
   CMP for EEA, UK, and Switzerland users.
6. Keep `/build-info` noindex and avoid placing manual ad units on internal,
   login-only, or non-content utility surfaces.

## Official References

- https://support.google.com/adsense/answer/7584263
- https://support.google.com/adsense/answer/7299563
- https://support.google.com/adsense/answer/48182
- https://support.google.com/adsense/answer/1348695
- https://support.google.com/adsense/answer/7670013
