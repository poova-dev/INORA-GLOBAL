# INORA GLOBAL EXIM — Premium Static B2B Export Website

Official web platform for **INORA GLOBAL EXIM**, an India-based Merchant Exporter and Global Sourcing Partner.

## Project Structure

```
/
├── index.html
├── /pages
│   ├── about.html
│   ├── products.html
│   ├── product-detail-template.html
│   ├── global-sourcing.html
│   ├── export-process.html
│   ├── quality.html
│   ├── markets.html
│   ├── blog.html
│   ├── quote.html
│   └── contact.html
├── /css
│   ├── variables.css      (brand tokens: --navy, --royal-blue, --gold, --white, --light-grey)
│   ├── base.css           (reset, typography, containers)
│   ├── components.css     (header, buttons, cards, forms, footer)
│   └── responsive.css     (360px to 1920px media queries)
├── /js
│   ├── main.js            (sticky header, drawer nav, accordions)
│   ├── animations.js      (GSAP 3.12, ScrollTrigger, 60FPS tilt)
│   ├── globe.js           (High-performance Canvas Trade Map engine)
│   ├── products.js        (Product catalog database & renderers)
│   ├── firebase.js        (Firebase Firestore client initialization)
│   └── enquiry.js         (B2B form submission & honeypot spam filter)
├── sitemap.xml
├── robots.txt
└── README.md
```

## Tech Stack
- HTML5, CSS3 (Modular variables, flexbox/grid), Vanilla JS (ES6+)
- GSAP 3.12+ & ScrollTrigger
- Lenis Smooth Scroll
- Firebase v9+ Firestore client SDK
- FontAwesome 6 & Google Fonts (Inter & Montserrat)

## Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /enquiries/{doc} {
      allow create: if request.resource.data.keys().hasAll(['fullName', 'email']);
      allow read: if false;
    }
    match /quotes/{doc} {
      allow create: if true;
      allow read: if false;
    }
  }
}
```

## Cloudflare Pages Deployment Instructions
1. Push workspace to GitHub repository.
2. Log into Cloudflare Pages & connect repository.
3. Build setting: **None** (Static site).
4. Output directory: `/` (Root directory).
5. Deploy site.
# INORA-GLOBAL
