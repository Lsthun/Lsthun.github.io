# Analytics Setup

This site is prepared for Google Analytics 4 tracking through `analytics.js`.

The current implementation is consent-aware:

- GA4 does not load until a visitor accepts the cookie banner.
- The site includes a dedicated privacy policy page.
- The site includes a Cookie Preferences control so visitors can reopen the banner.

## 1. Finish GA4 setup

1. Go to Google Analytics and create a property for `bslcampground.com`.
2. Add a Web data stream for `https://bslcampground.com`.
3. Copy the Measurement ID. It will look like `G-XXXXXXXXXX`.
4. Open `analytics.js` and paste that value into `GA4_MEASUREMENT_ID`.
5. Deploy the site.

Tracked events in this site:

- `phone_call_click`: clicks on `tel:` buttons and links.
- `directions_click`: clicks on Google Maps directions links.
- `outbound_click`: clicks from this site to other websites.

Recommended GA4 follow-up:

1. In GA4, go to Admin > Events.
2. Mark `phone_call_click` as a key event.
3. Mark `directions_click` as a key event.
4. Set your GA4 data retention period according to your preferred privacy posture.

## Privacy policy and cookie notice

This site now includes:

- `privacy-policy.html` for the public privacy notice
- a footer link to the Privacy Policy
- a cookie consent banner that blocks GA4 until acceptance

The privacy page includes:

- "We use Google Analytics"
- "We collect anonymous usage data"
- a link to Google's data usage page

## 2. Set up Google Search Console

Search Console is separate from GA4. It tells you which Google searches and pages are sending visitors.

Recommended setup:

1. Open Google Search Console.
2. Add a new property.
3. Choose `Domain` and enter `bslcampground.com`.
4. Verify ownership using the DNS TXT record at your domain registrar.
5. After verification, submit `https://bslcampground.com/` for indexing if needed.

Why domain verification is better here:

- It covers all versions of the site.
- It avoids editing the site again just for Search Console verification.
- It is the cleanest fit for a custom domain on GitHub Pages.

## 3. How UTM links work

UTM parameters are added to links that point to this site from outside sources.

Do use UTM tags on:

- Facebook posts
- Facebook ads
- Instagram bio links
- Google Business Profile website links when appropriate
- email campaigns
- QR codes

Do not use UTM tags for normal internal navigation on this site.

Example landing page with UTM parameters:

```text
https://bslcampground.com/?utm_source=facebook&utm_medium=social&utm_campaign=spring_getaways
```

If you run a paid Facebook campaign, use something like:

```text
https://bslcampground.com/?utm_source=facebook&utm_medium=paid_social&utm_campaign=summer_rv_sites
```

Suggested naming conventions:

- `utm_source`: the platform or source, such as `facebook`, `instagram`, `google`, `email`
- `utm_medium`: the channel, such as `social`, `paid_social`, `cpc`, `email`, `referral`
- `utm_campaign`: the marketing push, such as `summer_rv_sites`, `fall_weekends`, `monthly_stays`
- `utm_content`: optional, use it to distinguish versions such as `photo_ad`, `video_ad`, `cta_button`

Examples:

```text
Facebook organic:
https://bslcampground.com/?utm_source=facebook&utm_medium=social&utm_campaign=summer_rv_sites

Facebook ad variation A:
https://bslcampground.com/?utm_source=facebook&utm_medium=paid_social&utm_campaign=summer_rv_sites&utm_content=photo_a

Email newsletter:
https://bslcampground.com/?utm_source=email&utm_medium=email&utm_campaign=june_newsletter
```

## 4. What to expect in reports

Use GA4 for:

- traffic source and medium
- landing pages
- device mix
- calls and directions clicks
- campaign comparison with UTM tags

Use Search Console for:

- Google search queries
- impressions and clicks from search
- average ranking position
- pages getting search traffic

Best workflow:

1. Search Console tells you what people searched in Google.
2. GA4 tells you what those visitors did after arriving.
3. UTM tags tell you which marketing links caused visits and conversions.