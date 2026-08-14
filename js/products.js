/* ==========================================================================
   INORA GLOBAL EXIM - Products Database & Dynamic Renderer
   ========================================================================== */

let INORA_PRODUCTS = [
  {
    id: "rice",
    category: "RICE",
    stampLabel: "RICE",
    title: "Premium Indian Rice",
    description: "Sourced directly from top agricultural belts in India. High aroma, superior grain length, and uniform quality.",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    items: ["Ponni Rice", "Basmati Rice", "Non-Basmati Rice"],
    specs: {
      origin: "India",
      type: "Raw / Parboiled / Steam",
      moisture: "Based on buyer requirement",
      brokenGrains: "As per buyer specification",
      packaging: "5kg, 10kg, 25kg, 50kg PP / Jute Bags",
      moq: "Based on buyer requirement",
      capacity: "Based on buyer requirement"
    }
  },
  {
    id: "spices",
    category: "SPICES",
    stampLabel: "SPICES",
    title: "Pure & Aromatic Spices",
    description: "Authentic, flavorful Indian spices selected for high volatile oil content and strict cleanliness standards.",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    items: ["Black Pepper", "Cumin Seeds", "Turmeric", "Red Chili", "Green Cardamom", "Fennel Seeds"],
    specs: {
      origin: "India",
      type: "Whole / Ground",
      purity: "Based on buyer requirement",
      packaging: "25kg / 50kg Gunny or Custom Vacuum Pack",
      moq: "Based on buyer requirement",
      capacity: "Based on buyer requirement"
    }
  },
  {
    id: "powders",
    category: "VALUE-ADDED POWDERS",
    stampLabel: "POWDERS",
    title: "Value-Added Botanical Powders",
    description: "Fine mesh, nutrient-dense agricultural and herbal powders processed in hygienic processing units.",
    image: "assets/images/botanical-powders.jpg",
    items: ["Moringa Powder", "Curry Leaf Powder", "Garlic Powder", "Coriander Powder", "Turmeric Powder", "Red Chilli Powder", "Garam Masala"],
    specs: {
      origin: "India",
      form: "Fine Powder (80-100 Mesh)",
      additives: "100% Pure, No Artificial Preservatives",
      packaging: "20kg / 25kg Drums or Foil Pouches",
      moq: "Based on buyer requirement",
      capacity: "Based on buyer requirement"
    }
  },
  {
    id: "produce",
    category: "FRESH FRUITS & VEGETABLES",
    stampLabel: "PRODUCE",
    title: "Fresh Agricultural Produce",
    description: "Farm-fresh produce sorted, graded, and packed in temperature-monitored environments for export transit.",
    image: "assets/images/fresh-produce.jpg",
    items: ["Lemon", "Drumstick", "Ginger", "Green Chili", "Curry Leaves", "Coriander Leaves"],
    specs: {
      origin: "India",
      grading: "Export Grade A",
      shelfLife: "Maintained via Cold Chain Packaging",
      packaging: "Corrugated Box / Mesh Bags",
      moq: "Based on buyer requirement",
      capacity: "Based on buyer requirement"
    }
  },
  {
    id: "peanut",
    category: "PEANUT",
    stampLabel: "PEANUT",
    title: "Indian Groundnut / Peanut",
    description: "Bold and Java variety peanuts processed for food industry, snacking, and oil extraction.",
    image: "assets/images/peanuts.jpg",
    items: ["Bold Peanut", "Java Peanut", "Blanched Peanuts", "Peanut Kernels"],
    specs: {
      origin: "India",
      counts: "38/42, 40/50, 50/60, 60/70, 70/80, 80/90",
      moisture: "Based on buyer requirement",
      packaging: "25kg / 50kg Vacuum Jute Bags or PP Bags",
      moq: "Based on buyer requirement",
      capacity: "Based on buyer requirement"
    }
  },
  {
    id: "dehydrated",
    category: "DEHYDRATED PRODUCTS",
    stampLabel: "DEHYDRATED",
    title: "Dehydrated Vegetables & Fruits",
    description: "Premium dehydrated flakes, granules, and powders retaining natural aroma and long shelf life.",
    image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=800&q=80",
    items: ["Dehydrated Onion", "Dehydrated Garlic", "Dehydrated Ginger", "Dehydrated Green Chilli", "Dehydrated Mango", "Dehydrated Pineapple"],
    specs: {
      origin: "India",
      forms: "Flakes, Chopped, Minced, Granules, Powder",
      moisture: "Based on buyer requirement",
      packaging: "Poly-lined Cartons or Kraft Bags",
      moq: "Based on buyer requirement",
      capacity: "Based on buyer requirement"
    }
  }
];

/**
 * Initialize Firestore Dynamic Products Listener
 */
function initFirestoreProducts() {
  if (typeof firebase !== 'undefined' && firebase.firestore && db) {
    db.collection('products').onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        const firestoreProducts = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          firestoreProducts.push({
            id: doc.id,
            title: data.title || '',
            category: data.category || '',
            stampLabel: data.stampLabel || data.category || '',
            description: data.description || '',
            image: data.image || '',
            items: Array.isArray(data.items) ? data.items : [],
            origin: data.origin || (data.specs && data.specs.origin) || 'India',
            specs: data.specs || {
              origin: data.origin || 'India',
              forms: data.forms || 'Based on buyer requirement',
              packaging: data.packaging || 'Based on buyer requirement',
              moq: data.moq || 'Based on buyer requirement',
              capacity: data.capacity || 'Based on buyer requirement'
            }
          });
        });
        INORA_PRODUCTS = firestoreProducts;
        renderProductGrid('main-products-grid');
        renderProductGrid('catalog-products-grid');
        initProductDetail();
      }
    }, (err) => {
      console.warn("Firestore products fetch warning:", err);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initFirestoreProducts();
});

// Helper to render product grid dynamically on catalog page with category and search filter support
function renderProductGrid(containerId, categoryFilter = 'all', searchQuery = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredProducts = INORA_PRODUCTS.filter(product => {
    // Category Filter
    const matchesCategory = (categoryFilter === 'all') || 
      (product.id === categoryFilter) || 
      (product.category.toLowerCase() === categoryFilter.toLowerCase());

    // Search Query Filter
    const matchesSearch = !normalizedSearch || 
      product.title.toLowerCase().includes(normalizedSearch) ||
      product.category.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch) ||
      product.items.some(item => item.toLowerCase().includes(normalizedSearch));

    return matchesCategory && matchesSearch;
  });

  // Update catalog counter element if present
  const counterEl = document.getElementById('catalog-counter');
  if (counterEl) {
    counterEl.textContent = `Showing ${filteredProducts.length} of ${INORA_PRODUCTS.length} Export Categories`;
  }

  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="catalog-empty-state">
        <div class="catalog-empty-icon"><i class="fas fa-search"></i></div>
        <h3 style="color: var(--navy-darker); margin-bottom: 0.5rem;">No Matching Products Found</h3>
        <p style="color: var(--slate-muted); max-width: 450px; margin: 0 auto 1.5rem auto;">
          We couldn't find any export products matching your search term. Try adjusting your query or request custom sourcing.
        </p>
        <a href="sourcing.html" class="btn btn-gold">
          Submit Custom Sourcing Request <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredProducts.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
        <div class="export-stamp">${product.stampLabel || product.category}<br>&bull; INDIA &bull;</div>
      </div>
      <div class="product-content">
        <span class="product-category-label">${product.category}</span>
        <h3 class="product-title">${product.title}</h3>
        <p style="font-size: 0.88rem; color: var(--slate-muted); margin-bottom: 1rem; line-height: 1.55;">${product.description}</p>
        <div class="product-items-list">
          ${product.items.map(item => `<span class="product-item-chip">${item}</span>`).join('')}
        </div>
        <div class="product-card-footer">
          <a href="product-detail.html?cat=${product.id}" class="product-link">
            View Details & Specs <i class="fas fa-arrow-right"></i>
          </a>
          <a href="quote.html?product=${encodeURIComponent(product.title)}" class="btn btn-gold" style="padding: 0.4rem 0.9rem; font-size: 0.78rem;">
            Quote
          </a>
        </div>
      </div>
    </div>
  `).join('');

  if (typeof window.initProductCardsAnimation === 'function') {
    window.initProductCardsAnimation();
  }
}

// Initialize Catalog Page Search & Filter Tab Listeners
function initProductCatalog() {
  const container = document.getElementById('catalog-products-grid');
  if (!container) return;

  let currentCategory = 'all';
  let currentSearch = '';

  renderProductGrid('catalog-products-grid', currentCategory, currentSearch);

  // Search input event listener
  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderProductGrid('catalog-products-grid', currentCategory, currentSearch);
    });
  }

  // Filter tabs event listeners
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      currentCategory = tab.getAttribute('data-category') || 'all';
      renderProductGrid('catalog-products-grid', currentCategory, currentSearch);
    });
  });
}

// Initialize Dynamic Product Detail Page
function initProductDetail() {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const catId = urlParams.get('cat') || 'spices';
  
  const product = INORA_PRODUCTS.find(p => p.id === catId) || INORA_PRODUCTS[0];

  // Update dynamic hero header elements if present
  const heroTitle = document.getElementById('detail-hero-title');
  const heroBadge = document.getElementById('detail-hero-badge-text');
  const breadcrumbCurrent = document.getElementById('detail-breadcrumb-current');

  if (product) {
    document.title = `${product.title} - Technical Specifications | INORA GLOBAL EXIM`;
    
    if (heroTitle) heroTitle.textContent = product.title.toUpperCase();
    if (heroBadge) heroBadge.textContent = product.category;
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.title;

    container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <a href="products.html" style="color: var(--royal-blue); font-weight: 700; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 0.4rem;">
          <i class="fas fa-arrow-left"></i> Back to Products Directory
        </a>
      </div>

      <div class="product-detail-layout">
        <div class="product-detail-gallery">
          <div class="product-detail-img-box">
            <img src="${product.image}" alt="${product.title}">
            <div class="export-stamp">${product.stampLabel || product.category}<br>&bull; INDIA &bull;</div>
          </div>
          <div class="product-items-box">
            <div class="product-items-box-title"><i class="fas fa-list-check"></i> Export Varieties & Products</div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${product.items.map(item => `<span style="background: rgba(255,255,255,0.12); color: white; padding: 0.35rem 0.85rem; border-radius: 50px; font-size: 0.82rem; font-weight: 600;">${item}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="product-detail-info">
          <div class="product-detail-category">
            <span class="section-tag">${product.category}</span>
          </div>
          <h1 class="product-detail-title">${product.title}</h1>
          <p class="product-detail-desc">${product.description}</p>

          <div class="specs-header-title">
            <i class="fas fa-sliders text-gold"></i> Technical Specifications
          </div>

          <div class="product-specs-grid">
            ${Object.entries(product.specs).map(([key, value]) => `
              <div class="spec-box">
                <div class="spec-label">${key.replace(/([A-Z])/g, ' $1')}</div>
                <div class="spec-value">${value}</div>
              </div>
            `).join('')}
          </div>

          <div class="product-detail-actions">
            <a href="quote.html?product=${encodeURIComponent(product.title)}" class="btn btn-gold" style="padding: 0.9rem 1.8rem;">
              REQUEST QUOTE <i class="fas fa-paper-plane"></i>
            </a>
            <a href="https://wa.me/917200819993?text=Hello%20INORA%20GLOBAL,%20I%20want%20a%20quote%20for%20${encodeURIComponent(product.title)}" target="_blank" rel="noopener" class="btn btn-navy" style="padding: 0.9rem 1.5rem;">
              <i class="fab fa-whatsapp" style="color: #25D366;"></i> WHATSAPP US
            </a>
            <button onclick="window.print()" class="btn btn-outline-white" style="color: var(--navy-darker); border-color: var(--grey-border); padding: 0.9rem 1.2rem;" aria-label="Print Product Specifications">
              <i class="fas fa-print"></i> Print Specs
            </button>
          </div>
        </div>
      </div>
    `;

    // Render Related Products
    renderRelatedProducts('related-products-grid', product.id);
  }
}

// Render Related Products (excluding current product)
function renderRelatedProducts(containerId, currentId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const related = INORA_PRODUCTS.filter(p => p.id !== currentId).slice(0, 3);

  container.innerHTML = related.map(product => `
    <div class="product-card">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
        <div class="export-stamp">${product.stampLabel || product.category}<br>&bull; INDIA &bull;</div>
      </div>
      <div class="product-content">
        <span class="product-category-label">${product.category}</span>
        <h3 class="product-title">${product.title}</h3>
        <p style="font-size: 0.88rem; color: var(--slate-muted); margin-bottom: 1rem; line-height: 1.55;">${product.description}</p>
        <div class="product-card-footer">
          <a href="product-detail.html?cat=${product.id}" class="product-link">
            View Details <i class="fas fa-arrow-right"></i>
          </a>
          <a href="quote.html?product=${encodeURIComponent(product.title)}" class="btn btn-gold" style="padding: 0.4rem 0.9rem; font-size: 0.78rem;">
            Quote
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  initProductCatalog();
  initProductDetail();
});
