/* ==========================================================================
   INORA GLOBAL EXIM - Products Database & Renderer
   ========================================================================== */

const INORA_PRODUCTS = [
  {
    id: "rice",
    category: "RICE",
    title: "Premium Indian Rice",
    description: "Sourced directly from top agricultural belts in India. High aroma, superior grain length, and uniform quality.",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    items: ["Ponni Rice", "Basmati Rice", "Non-Basmati Rice"],
    specs: {
      origin: "India (Tamil Nadu, Punjab, Andhra Pradesh)",
      type: "Raw / Parboiled / Steam",
      moisture: "Max 12-14%",
      admixture: "Max 1%",
      brokenGrains: "1%, 5%, 25% (as per buyer spec)",
      packaging: "5kg, 10kg, 25kg, 50kg PP / Non-Woven / Jute Bags",
      moq: "1 x 20ft FCL (approx. 24-25 MT)",
      capacity: "Based on buyer requirement"
    }
  },
  {
    id: "spices",
    category: "SPICES",
    title: "Pure & Aromatic Spices",
    description: "Authentic, flavorful Indian spices selected for high volatile oil content and strict cleanliness standards.",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    items: ["Black Pepper", "Cumin Seeds", "Turmeric", "Red Chili", "Green Cardamom", "Fennel Seeds"],
    specs: {
      origin: "India (Kerala, Rajasthan, Gujarat, Tamil Nadu)",
      type: "Whole / Ground",
      purity: "99% min",
      extraneous: "Max 1%",
      packaging: "25kg / 50kg Gunny / PP Bags or Custom Vacuum Pack",
      moq: "5 MT to 1 FCL",
      capacity: "Based on buyer requirement"
    }
  },
  {
    id: "powders",
    category: "VALUE-ADDED POWDERS",
    title: "Value-Added Botanical Powders",
    description: "Fine mesh, nutrient-dense agricultural and herbal powders processed in hygienic processing units.",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
    items: ["Moringa Powder", "Curry Leaf Powder", "Garlic Powder", "Coriander Powder", "Turmeric Powder", "Red Chilli Powder", "Garam Masala"],
    specs: {
      origin: "India",
      form: "Fine Powder (80-100 Mesh)",
      color: "Natural Characteristic Color",
      additives: "100% Pure, No Artificial Colors or Preservatives",
      packaging: "20kg / 25kg HDPE Drums or Aluminum Foil Pouches",
      moq: "1000 kg",
      capacity: "Based on buyer requirement"
    }
  },
  {
    id: "produce",
    category: "FRESH FRUITS & VEGETABLES",
    title: "Fresh Agricultural Produce",
    description: "Farm-fresh produce sorted, graded, and packed in temperature-monitored environments for export transit.",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
    items: ["Lemon", "Drumstick", "Ginger", "Green Chili", "Curry Leaves", "Coriander Leaves"],
    specs: {
      origin: "India",
      grading: "Export Grade A",
      shelfLife: "Maintained via Cold Chain Cold Storage Packaging",
      packaging: "Corrugated Box / Mesh Bags (5kg, 10kg, 15kg)",
      moq: "Air Freight (1 MT+) or Reefer Container",
      capacity: "Based on buyer requirement"
    }
  },
  {
    id: "peanut",
    category: "PEANUT",
    title: "Indian Groundnut / Peanut",
    description: "Bold and Java variety peanuts processed for food industry, snacking, and oil extraction.",
    image: "https://images.unsplash.com/photo-1567892336302-23c0eb4c2f42?auto=format&fit=crop&w=800&q=80",
    items: ["Bold Peanut", "Java Peanut", "Blanched Peanuts", "Peanut Kernels"],
    specs: {
      origin: "India (Gujarat, Andhra Pradesh, Tamil Nadu)",
      counts: "38/42, 40/50, 50/60, 60/70, 70/80, 80/90",
      aflatoxin: "Below 4 ppb / 10 ppb (as per destination port limit)",
      moisture: "Max 7-8%",
      packaging: "25kg / 50kg Vacuum Jute Bags or PP Bags",
      moq: "1 x 20ft FCL (19 MT)",
      capacity: "Based on buyer requirement"
    }
  },
  {
    id: "dehydrated",
    category: "DEHYDRATED PRODUCTS",
    title: "Dehydrated Vegetables & Fruits",
    description: "Premium dehydrated flakes, granules, and powders retaining natural aroma and long shelf life.",
    image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=800&q=80",
    items: ["Dehydrated Onion", "Dehydrated Garlic", "Dehydrated Ginger", "Dehydrated Green Chilli", "Dehydrated Mango", "Dehydrated Pineapple"],
    specs: {
      origin: "India",
      forms: "Flakes, Chopped, Minced, Granules, Powder",
      moisture: "Max 5-6%",
      packaging: "14kg, 20kg Poly-lined Cartons or Kraft Bags",
      moq: "1 MT to 1 FCL",
      capacity: "Based on buyer requirement"
    }
  }
];

// Helper to render product grid dynamically on pages
function renderProductGrid(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = INORA_PRODUCTS.map(product => `
    <div class="product-card" data-tilt data-id="${product.id}">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
        <div class="export-stamp">${product.category}<br>&bull; INDIA &bull;</div>
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
}
