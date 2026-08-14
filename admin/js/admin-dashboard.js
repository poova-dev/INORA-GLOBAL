/* ==========================================================================
   INORA GLOBAL EXIM — Admin Dashboard Controller
   Firestore-First Architecture (No LocalStorage Fallbacks)
   Includes: Overview Metrics, Enquiries Manager, Product CRUD & Cloudinary Uploads
   ========================================================================== */

// Session In-Memory Caches (Pure render speed optimization, non-authoritative)
let enquiriesCache = [];
let productsCache = [];

let currentFilterFormType = 'all';
let currentFilterStatus = 'all';
let currentSearchQuery = '';
let currentProductSearchQuery = '';
let currentProductCategoryFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();

  // Bind Enquiries Filters
  const formTypeSelect = document.getElementById('filter-form-type');
  if (formTypeSelect) {
    formTypeSelect.addEventListener('change', (e) => {
      currentFilterFormType = e.target.value;
      renderEnquiriesTable();
    });
  }

  const statusSelect = document.getElementById('filter-status');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      currentFilterStatus = e.target.value;
      renderEnquiriesTable();
    });
  }

  const searchInput = document.getElementById('admin-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderEnquiriesTable();
    });
  }
});

/**
 * Initialize Dashboard Snapshot Listeners for Enquiries & Products
 */
function initAdminDashboard() {
  if (typeof firebase !== 'undefined' && firebase.firestore && db && firebase.apps.length) {
    // 1. Real-time Enquiries Listener
    db.collection('enquiries').onSnapshot((snapshot) => {
      let items = [];
      snapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort descending by timestamp
      items.sort((a, b) => {
        const timeA = a.timestamp ? (a.timestamp.seconds ? a.timestamp.seconds * 1000 : new Date(a.timestamp).getTime()) : 0;
        const timeB = b.timestamp ? (b.timestamp.seconds ? b.timestamp.seconds * 1000 : new Date(b.timestamp).getTime()) : 0;
        return timeB - timeA;
      });

      enquiriesCache = items;
      renderEnquiriesTable();
      updateOverviewMetrics();
    }, (err) => {
      console.error("Firestore enquiries fetch error:", err);
      const tbody = document.getElementById('enquiries-table-body');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 3rem; color: #EF4444;">
              <i class="fas fa-exclamation-circle" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
              Failed to load enquiries from Firestore: ${err.message}
            </td>
          </tr>
        `;
      }
    });

    // 2. Real-time Products Listener
    db.collection('products').onSnapshot((snapshot) => {
      let prods = [];
      snapshot.forEach((doc) => {
        prods.push({
          id: doc.id,
          ...doc.data()
        });
      });

      productsCache = prods;
      renderAdminProductsGrid();
      updateOverviewMetrics();

      // Show seed migration banner if products collection is completely empty
      const banner = document.getElementById('seed-migration-banner');
      const seedBtn = document.getElementById('migrate-seed-btn');
      if (prods.length === 0) {
        if (banner) banner.style.display = 'block';
        if (seedBtn) seedBtn.style.display = 'inline-flex';
      } else {
        if (banner) banner.style.display = 'none';
        if (seedBtn) seedBtn.style.display = 'none';
      }
    }, (err) => {
      console.error("Firestore products fetch error:", err);
      const grid = document.getElementById('admin-products-grid');
      if (grid) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #EF4444;">
            <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
            Failed to load products from Firestore: ${err.message}
          </div>
        `;
      }
    });

  } else {
    console.error("Firebase not initialized in initAdminDashboard.");
  }
}

/* ==========================================================================
   TAB SWITCHING NAVIGATION
   ========================================================================== */

function switchMainTab(tabId) {
  const tabs = ['overview', 'enquiries', 'products'];
  tabs.forEach(t => {
    const pane = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`tab-nav-${t}`);
    if (pane) pane.classList.remove('active');
    if (navBtn) navBtn.classList.remove('active');
  });

  const activePane = document.getElementById(`tab-${tabId}`);
  const activeNav = document.getElementById(`tab-nav-${tabId}`);
  if (activePane) activePane.classList.add('active');
  if (activeNav) activeNav.classList.add('active');

  const titleEl = document.getElementById('admin-header-title');
  if (titleEl) {
    if (tabId === 'overview') titleEl.textContent = 'Executive Dashboard Overview';
    else if (tabId === 'enquiries') titleEl.textContent = 'B2B Lead Enquiries & Quote Requests';
    else if (tabId === 'products') titleEl.textContent = 'Live Export Product Catalogue (CRUD)';
  }
}

/* ==========================================================================
   OVERVIEW TAB METRICS & ACTIVITY FEED
   ========================================================================== */

function updateOverviewMetrics() {
  // Unread enquiries
  const unreadCount = enquiriesCache.filter(e => e.status === 'NEW_ENQUIRY' || !e.status).length;
  const closedCount = enquiriesCache.filter(e => e.status === 'CLOSED').length;

  // Header badges
  const unreadBadge = document.getElementById('sidebar-unread-count');
  const prodBadge = document.getElementById('sidebar-product-count');
  if (unreadBadge) unreadBadge.textContent = unreadCount;
  if (prodBadge) prodBadge.textContent = productsCache.length;

  // Overview stats
  const statProd = document.getElementById('overview-stat-products');
  const statEnq = document.getElementById('overview-stat-enquiries');
  const statNew = document.getElementById('overview-stat-new');
  const statClosed = document.getElementById('overview-stat-closed');

  if (statProd) statProd.textContent = productsCache.length;
  if (statEnq) statEnq.textContent = enquiriesCache.length;
  if (statNew) statNew.textContent = unreadCount;
  if (statClosed) statClosed.textContent = closedCount;

  // Render Category Progress Bars
  renderOverviewCategoryProgress();

  // Render Activity Feed
  renderOverviewActivityFeed();
}

function renderOverviewCategoryProgress() {
  const container = document.getElementById('overview-category-progress-list');
  if (!container) return;

  if (productsCache.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--admin-text-dim); padding: 1.5rem;">
        No product categories in Firestore yet.
      </div>
    `;
    return;
  }

  const categoryCounts = {};
  productsCache.forEach(p => {
    const cat = (p.category || 'UNCATEGORIZED').toUpperCase();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const total = productsCache.length;

  container.innerHTML = Object.entries(categoryCounts).map(([cat, count]) => {
    const percent = Math.round((count / total) * 100);
    return `
      <div class="cat-progress-item">
        <div class="cat-progress-labels">
          <span style="color: var(--admin-text-main);">${cat}</span>
          <span style="color: var(--admin-gold);">${count} Products (${percent}%)</span>
        </div>
        <div class="cat-progress-bar-bg">
          <div class="cat-progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderOverviewActivityFeed() {
  const container = document.getElementById('overview-activity-feed');
  if (!container) return;

  const activities = [];

  // Recent 5 enquiries
  enquiriesCache.slice(0, 5).forEach(enq => {
    activities.push({
      type: 'ENQUIRY',
      title: `New ${enq.formType || 'Lead'} from ${enq.fullName || 'Buyer'} (${enq.country || 'Global'})`,
      time: enq.timestamp ? formatActivityDate(enq.timestamp) : 'Recently',
      badge: 'new'
    });
  });

  // Recent products
  productsCache.slice(0, 5).forEach(prod => {
    activities.push({
      type: 'PRODUCT',
      title: `Product catalog entry: ${prod.title} [${prod.category || 'EXPORT'}]`,
      time: prod.createdAt ? formatActivityDate(prod.createdAt) : 'Catalog Active',
      badge: 'product'
    });
  });

  if (activities.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--admin-text-dim); padding: 1.5rem;">
        No recent activity logged yet.
      </div>
    `;
    return;
  }

  container.innerHTML = activities.slice(0, 7).map(act => `
    <div class="activity-item">
      <div class="activity-dot ${act.badge}"></div>
      <div>
        <div class="activity-desc">${act.title}</div>
        <div class="activity-time">${act.time}</div>
      </div>
    </div>
  `).join('');
}

function formatActivityDate(ts) {
  if (!ts) return 'Recently';
  const dateObj = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ==========================================================================
   ENQUIRIES TABLE & DETAIL MODAL
   ========================================================================== */

function renderEnquiriesTable() {
  const tbody = document.getElementById('enquiries-table-body');
  if (!tbody) return;

  const search = currentSearchQuery.trim().toLowerCase();

  const filtered = enquiriesCache.filter(item => {
    const matchesForm = (currentFilterFormType === 'all') || (item.formType === currentFilterFormType);
    const matchesStatus = (currentFilterStatus === 'all') || (item.status === currentFilterStatus);

    const matchesSearch = !search ||
      (item.fullName && item.fullName.toLowerCase().includes(search)) ||
      (item.email && item.email.toLowerCase().includes(search)) ||
      (item.companyName && item.companyName.toLowerCase().includes(search)) ||
      (item.country && item.country.toLowerCase().includes(search)) ||
      (item.productTitle && item.productTitle.toLowerCase().includes(search));

    return matchesForm && matchesStatus && matchesSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem; color: var(--admin-text-muted);">
          <i class="fas fa-inbox" style="font-size: 2rem; color: var(--admin-text-dim); margin-bottom: 0.5rem; display: block;"></i>
          No B2B lead enquiries matching current filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const formattedDate = formatActivityDate(item.timestamp);
    const statusClass = item.status === 'CLOSED' ? 'color: var(--admin-accent-green);' : (item.status === 'CONTACTED' ? 'color: var(--admin-accent-blue);' : 'color: var(--admin-gold); font-weight: 700;');

    return `
      <tr>
        <td style="font-size: 0.8rem; font-family: var(--font-mono);">${formattedDate}</td>
        <td><span style="background: rgba(255,255,255,0.06); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase;">${item.formType || 'quote'}</span></td>
        <td style="font-weight: 700; color: var(--admin-text-main);">${item.fullName || 'Anonymous'}</td>
        <td>${item.companyName || 'N/A'}<br><span style="font-size: 0.78rem; color: var(--admin-text-muted);">&bull; ${item.country || 'Global'}</span></td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.productTitle || item.message || 'General Inquiry'}</td>
        <td>
          <select onchange="updateLeadStatus('${item.id}', this.value)" class="admin-select" style="padding: 0.25rem 0.5rem; font-size: 0.78rem; ${statusClass}">
            <option value="NEW_ENQUIRY" ${item.status === 'NEW_ENQUIRY' ? 'selected' : ''}>NEW_ENQUIRY</option>
            <option value="CONTACTED" ${item.status === 'CONTACTED' ? 'selected' : ''}>CONTACTED</option>
            <option value="IN_PROGRESS" ${item.status === 'IN_PROGRESS' ? 'selected' : ''}>IN_PROGRESS</option>
            <option value="CLOSED" ${item.status === 'CLOSED' ? 'selected' : ''}>CLOSED</option>
          </select>
        </td>
        <td style="text-align: right;">
          <button onclick="openLeadModal('${item.id}')" class="btn-card-action btn-card-edit" style="display: inline-flex; padding: 0.35rem 0.7rem; font-size: 0.78rem;">
            <i class="fas fa-eye"></i> View Lead
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function updateLeadStatus(docId, newStatus) {
  if (!docId) return;
  try {
    await db.collection('enquiries').doc(docId).update({
      status: newStatus,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    console.error("Error updating lead status:", err);
    alert("Failed to update lead status: " + err.message);
  }
}

function openLeadModal(docId) {
  const lead = enquiriesCache.find(e => e.id === docId);
  if (!lead) return;

  const overlay = document.getElementById('lead-modal-overlay');
  if (!overlay) return;

  document.getElementById('modal-form-badge').textContent = (lead.formType || 'ENQUIRY').toUpperCase();
  document.getElementById('modal-date-val').textContent = formatActivityDate(lead.timestamp);
  document.getElementById('modal-buyer-name').textContent = lead.fullName || 'Buyer Lead';
  document.getElementById('modal-buyer-company').textContent = `${lead.companyName || 'Private Business'} • ${lead.country || 'Global Market'}`;

  document.getElementById('modal-email-val').textContent = lead.email || 'N/A';
  document.getElementById('modal-phone-val').textContent = lead.phone || 'N/A';
  document.getElementById('modal-businesstype-val').textContent = lead.businessType || 'N/A';
  document.getElementById('modal-product-val').textContent = lead.productTitle || 'N/A';
  document.getElementById('modal-quantity-val').textContent = lead.quantityNeeded || 'N/A';
  document.getElementById('modal-port-val').textContent = lead.destinationPort || 'N/A';
  document.getElementById('modal-message-val').textContent = lead.message || 'No additional message details provided.';

  // Links
  const emailLink = document.getElementById('modal-email-link');
  if (emailLink) emailLink.href = `mailto:${lead.email}?subject=RE:%20INORA%20GLOBAL%20EXIM%20Quote%20Inquiry`;

  const waLink = document.getElementById('modal-whatsapp-link');
  if (waLink) {
    const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
    waLink.href = cleanPhone ? `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(lead.fullName || '')},%20following%20up%20from%20INORA%20GLOBAL%20EXIM.` : `https://wa.me/917200819993`;
  }

  overlay.classList.add('open');
}

function closeLeadModal() {
  const overlay = document.getElementById('lead-modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

function exportEnquiriesCSV() {
  if (enquiriesCache.length === 0) {
    alert("No enquiries available to export.");
    return;
  }

  const headers = ["Timestamp", "Form Type", "Full Name", "Company", "Country", "Email", "Phone", "Product Title", "Quantity", "Status", "Message"];
  const rows = enquiriesCache.map(e => [
    formatActivityDate(e.timestamp),
    e.formType || '',
    `"${(e.fullName || '').replace(/"/g, '""')}"`,
    `"${(e.companyName || '').replace(/"/g, '""')}"`,
    `"${(e.country || '').replace(/"/g, '""')}"`,
    `"${(e.email || '').replace(/"/g, '""')}"`,
    `"${(e.phone || '').replace(/"/g, '""')}"`,
    `"${(e.productTitle || '').replace(/"/g, '""')}"`,
    `"${(e.quantityNeeded || '').replace(/"/g, '""')}"`,
    e.status || 'NEW_ENQUIRY',
    `"${(e.message || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `INORA_B2B_Enquiries_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ==========================================================================
   PRODUCTS CRUD CONTROLLER
   ========================================================================== */

function renderAdminProductsGrid() {
  const grid = document.getElementById('admin-products-grid');
  if (!grid) return;

  const filtered = productsCache.filter(p => {
    const matchesCategory = (currentProductCategoryFilter === 'all') || (p.category === currentProductCategoryFilter);
    const search = currentProductSearchQuery.trim().toLowerCase();

    const matchesSearch = !search ||
      (p.title && p.title.toLowerCase().includes(search)) ||
      (p.category && p.category.toLowerCase().includes(search)) ||
      (p.description && p.description.toLowerCase().includes(search)) ||
      (p.items && p.items.some && p.items.some(i => i.toLowerCase().includes(search)));

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1;">
        <div class="admin-empty-state">
          <div class="empty-state-icon"><i class="fas fa-boxes"></i></div>
          <div class="empty-state-title">No Products Found</div>
          <div class="empty-state-desc">No export products found matching your search or category filter. Add your first product document to Firestore.</div>
          <button onclick="openAddProductModal()" class="btn-admin-gold">
            <i class="fas fa-plus"></i> Add New Product
          </button>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="admin-product-card">
      <div class="admin-product-img-wrap">
        <img src="${p.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'}" alt="${p.title}">
        <span class="admin-product-cat-tag">${p.category || 'EXPORT'}</span>
      </div>
      <div class="admin-product-body">
        <h3 class="admin-product-title">${p.title || 'Untitled Product'}</h3>
        <p class="admin-product-desc">${p.description || 'No description provided.'}</p>

        <div class="admin-product-items">
          ${(Array.isArray(p.items) ? p.items : []).map(item => `<span class="admin-item-chip">${item}</span>`).join('')}
        </div>

        <div class="admin-product-actions">
          <button onclick="openEditProductModal('${p.id}')" class="btn-card-action btn-card-edit">
            <i class="fas fa-edit"></i> Edit Specs
          </button>
          <button onclick="deleteProduct('${p.id}', '${escapeQuotes(p.title)}')" class="btn-card-action btn-card-delete">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function escapeQuotes(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function filterAdminProducts() {
  const searchInput = document.getElementById('product-search-input');
  const catSelect = document.getElementById('product-category-filter');

  if (searchInput) currentProductSearchQuery = searchInput.value;
  if (catSelect) currentProductCategoryFilter = catSelect.value;

  renderAdminProductsGrid();
}

function openAddProductModal() {
  document.getElementById('pm-doc-id').value = '';
  document.getElementById('pm-title').value = '';
  document.getElementById('pm-category').value = 'RICE';
  document.getElementById('pm-description').value = '';
  document.getElementById('pm-items').value = '';
  document.getElementById('pm-image-url').value = '';
  document.getElementById('pm-origin').value = 'India';
  document.getElementById('pm-forms').value = 'Based on buyer requirement';
  document.getElementById('pm-packaging').value = 'Based on buyer requirement';
  document.getElementById('pm-moq').value = 'Based on buyer requirement';
  document.getElementById('pm-capacity').value = 'Based on buyer requirement';

  document.getElementById('image-preview-box').style.display = 'none';
  document.getElementById('product-modal-heading').innerHTML = '<i class="fas fa-plus-circle"></i> Add Export Product Document';

  const overlay = document.getElementById('product-modal-overlay');
  if (overlay) overlay.classList.add('open');
}

function openEditProductModal(docId) {
  const prod = productsCache.find(p => p.id === docId);
  if (!prod) return;

  document.getElementById('pm-doc-id').value = prod.id;
  document.getElementById('pm-title').value = prod.title || '';
  document.getElementById('pm-category').value = (prod.category || 'RICE').toUpperCase();
  document.getElementById('pm-description').value = prod.description || '';
  document.getElementById('pm-items').value = Array.isArray(prod.items) ? prod.items.join(', ') : (prod.items || '');
  document.getElementById('pm-image-url').value = prod.image || '';

  const specs = prod.specs || {};
  document.getElementById('pm-origin').value = prod.origin || specs.origin || 'India';
  document.getElementById('pm-forms').value = prod.forms || specs.forms || specs.type || 'Based on buyer requirement';
  document.getElementById('pm-packaging').value = prod.packaging || specs.packaging || 'Based on buyer requirement';
  document.getElementById('pm-moq').value = prod.moq || specs.moq || 'Based on buyer requirement';
  document.getElementById('pm-capacity').value = prod.capacity || specs.capacity || 'Based on buyer requirement';

  if (prod.image) {
    const previewBox = document.getElementById('image-preview-box');
    const previewImg = document.getElementById('pm-image-preview');
    if (previewBox && previewImg) {
      previewImg.src = prod.image;
      previewBox.style.display = 'flex';
    }
  }

  document.getElementById('product-modal-heading').innerHTML = `<i class="fas fa-edit"></i> Edit ${prod.title}`;

  const overlay = document.getElementById('product-modal-overlay');
  if (overlay) overlay.classList.add('open');
}

function closeProductModal() {
  const overlay = document.getElementById('product-modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

async function handleProductFormSubmit(e) {
  e.preventDefault();

  const docId = document.getElementById('pm-doc-id').value.trim();
  const title = document.getElementById('pm-title').value.trim();
  const category = document.getElementById('pm-category').value.trim();
  const description = document.getElementById('pm-description').value.trim();
  const itemsString = document.getElementById('pm-items').value.trim();
  const image = document.getElementById('pm-image-url').value.trim();
  const origin = document.getElementById('pm-origin').value.trim() || 'India';
  const forms = document.getElementById('pm-forms').value.trim() || 'Based on buyer requirement';
  const packaging = document.getElementById('pm-packaging').value.trim() || 'Based on buyer requirement';
  const moq = document.getElementById('pm-moq').value.trim() || 'Based on buyer requirement';
  const capacity = document.getElementById('pm-capacity').value.trim() || 'Based on buyer requirement';

  const items = itemsString.split(',').map(s => s.trim()).filter(Boolean);

  const payload = {
    title,
    category,
    stampLabel: category,
    description,
    items,
    image,
    origin,
    forms,
    packaging,
    moq,
    capacity,
    specs: {
      origin,
      forms,
      packaging,
      moq,
      capacity
    },
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  const submitBtn = document.getElementById('save-product-submit-btn');

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving to Firestore...';
    }

    if (docId) {
      // Update existing Firestore product document
      await db.collection('products').doc(docId).update(payload);
    } else {
      // Create new Firestore product document
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('products').add(payload);
    }

    closeProductModal();
  } catch (err) {
    console.error("Error saving product to Firestore:", err);
    alert("Failed to save product document: " + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Product';
    }
  }
}

async function deleteProduct(docId, title) {
  if (!docId) return;
  const confirmed = confirm(`Are you sure you want to delete "${title}" from the live Firestore product catalog?\nThis action cannot be undone.`);
  if (!confirmed) return;

  try {
    await db.collection('products').doc(docId).delete();
  } catch (err) {
    console.error("Error deleting product:", err);
    alert("Failed to delete product document: " + err.message);
  }
}

/**
 * Cloudinary File Upload Integration for Products
 */
async function handleProductCloudinaryUpload(fileInput) {
  if (!fileInput || !fileInput.files || !fileInput.files[0]) return;

  const file = fileInput.files[0];
  const progressBox = document.getElementById('cloudinary-upload-progress');
  const progressFill = document.getElementById('upload-progress-fill');
  const statusText = document.getElementById('upload-status-text');

  try {
    if (progressBox) progressBox.style.display = 'block';
    if (progressFill) progressFill.style.width = '30%';
    if (statusText) statusText.textContent = `Uploading ${file.name} to Cloudinary...`;

    if (typeof uploadToCloudinary !== 'function') {
      throw new Error("uploadToCloudinary function unavailable in js/cloudinary.js");
    }

    const result = await uploadToCloudinary(file);

    if (progressFill) progressFill.style.width = '100%';
    if (statusText) statusText.textContent = "Upload successful!";

    document.getElementById('pm-image-url').value = result.url;

    const previewBox = document.getElementById('image-preview-box');
    const previewImg = document.getElementById('pm-image-preview');
    if (previewBox && previewImg) {
      previewImg.src = result.url;
      previewBox.style.display = 'flex';
    }
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    if (statusText) statusText.textContent = "Upload failed: " + err.message;
    alert("Cloudinary image upload failed: " + err.message);
  }
}

/* ==========================================================================
   ONE-TIME FIRESTORE PRODUCT SEED MIGRATION TOOL
   ========================================================================== */

async function triggerProductSeedMigration() {
  if (typeof INORA_PRODUCTS === 'undefined' || !Array.isArray(INORA_PRODUCTS)) {
    alert("Static INORA_PRODUCTS catalog array not found in js/products.js.");
    return;
  }

  const confirmed = confirm(`This will seed ${INORA_PRODUCTS.length} default agricultural product categories into your Cloud Firestore "products" collection.\n\nProceed?`);
  if (!confirmed) return;

  const seedBtn = document.getElementById('migrate-seed-btn');
  try {
    if (seedBtn) {
      seedBtn.disabled = true;
      seedBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Seeding Firestore...';
    }

    for (const prod of INORA_PRODUCTS) {
      const payload = {
        title: prod.title,
        category: prod.category,
        stampLabel: prod.stampLabel || prod.category,
        description: prod.description,
        items: prod.items || [],
        image: prod.image,
        origin: (prod.specs && prod.specs.origin) || "India",
        forms: (prod.specs && (prod.specs.forms || prod.specs.type)) || "Based on buyer requirement",
        packaging: (prod.specs && prod.specs.packaging) || "Based on buyer requirement",
        moq: (prod.specs && prod.specs.moq) || "Based on buyer requirement",
        capacity: (prod.specs && prod.specs.capacity) || "Based on buyer requirement",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('products').doc(prod.id).set(payload, { merge: true });
    }

    alert("Successfully seeded product catalog to Firestore!");
  } catch (err) {
    console.error("Product seed migration error:", err);
    alert("Migration failed: " + err.message);
  } finally {
    if (seedBtn) {
      seedBtn.disabled = false;
      seedBtn.innerHTML = '<i class="fas fa-cloud-arrow-up"></i> Seed Products to Firestore';
    }
  }
}
