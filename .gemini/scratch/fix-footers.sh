#!/bin/bash
# This script replaces minimal footers in all subpages with the full 4-column footer

FULL_FOOTER='  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="logo-wrapper" style="margin-bottom: 1rem;">
            <div class="logo-icon">IG</div>
            <div class="logo-text">
              <span class="logo-brand">INORA GLOBAL EXIM</span>
              <span class="logo-tagline">BEYOND BORDERS, BUILDING TRUST.</span>
            </div>
          </div>
          <p class="footer-brand-desc">
            Indian Merchant Exporter \&amp; Global Sourcing Partner connecting international buyers with premium agricultural, food, and value-added goods.
          </p>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem; font-size: 1.2rem;">
            <a href="#" style="color: var(--gold);" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="#" style="color: var(--gold);" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" style="color: var(--gold);" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
            <a href="https://wa.me/917200819993" style="color: var(--gold);" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
          </div>
        </div>

        <div>
          <h4 class="footer-col-title">Quick Links</h4>
          <div class="footer-links">
            <a href="index.html" class="footer-link">Home</a>
            <a href="about.html" class="footer-link">About Us</a>
            <a href="products.html" class="footer-link">Products Catalogue</a>
            <a href="sourcing.html" class="footer-link">Global Sourcing</a>
            <a href="export-process.html" class="footer-link">Export Process</a>
            <a href="quality.html" class="footer-link">Quality Standards</a>
            <a href="markets.html" class="footer-link">Target Markets</a>
            <a href="quote.html" class="footer-link">Request A Quote</a>
            <a href="contact.html" class="footer-link">Contact Us</a>
          </div>
        </div>

        <div>
          <h4 class="footer-col-title">Export Products</h4>
          <div class="footer-links">
            <a href="products.html" class="footer-link">Indian Rice (Ponni / Basmati)</a>
            <a href="products.html" class="footer-link">Spices (Pepper, Turmeric, Cumin)</a>
            <a href="products.html" class="footer-link">Value-Added Powders (Moringa)</a>
            <a href="products.html" class="footer-link">Fresh Produce (Lemon, Drumstick)</a>
            <a href="products.html" class="footer-link">Groundnut / Peanuts</a>
            <a href="products.html" class="footer-link">Dehydrated Onion \&amp; Garlic</a>
          </div>
        </div>

        <div>
          <h4 class="footer-col-title">Contact Office</h4>
          <p style="font-size: 0.88rem; margin-bottom: 0.8rem; line-height: 1.6;">
            <strong>INORA GLOBAL EXIM</strong><br>
            60 A Karunigar Street (Palla Street),<br>
            Thiruninravur, Thiruvallur \&ndash; 602024,<br>
            Tamil Nadu, India.
          </p>
          <p style="font-size: 0.88rem; margin-bottom: 0.5rem;">
            <i class="fas fa-phone text-gold"></i> +91 72008 19993
          </p>
          <p style="font-size: 0.88rem;">
            <i class="fas fa-envelope text-gold"></i> exports@inoraglobal.com
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <div>\&copy; 2026 INORA GLOBAL EXIM. All Rights Reserved.</div>
        <div>Indian Merchant Exporter \&bull; Global Sourcing Partner</div>
      </div>
    </div>
  </footer>'

echo "Footer template ready"
