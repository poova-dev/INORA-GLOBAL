/* ==========================================================================
   INORA GLOBAL EXIM - Admin Dashboard Controller
   ========================================================================== */

let allEnquiries = [];
let currentFilterFormType = 'all';
let currentFilterStatus = 'all';
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();

  // Bind filter dropdowns
  const formTypeSelect = document.getElementById('filter-form-type');
  if (formTypeSelect) {
    formTypeSelect.addEventListener('change', (e) => {
      currentFilterFormType = e.target.value;
      renderDashboardTable();
    });
  }

  const statusSelect = document.getElementById('filter-status');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      currentFilterStatus = e.target.value;
      renderDashboardTable();
    });
  }

  const searchInput = document.getElementById('admin-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderDashboardTable();
    });
  }

  const exportBtn = document.getElementById('export-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportEnquiriesCSV);
  }
});

/**
 * Initialize Dashboard Data Fetching
 */
function initDashboard() {
  if (typeof firebase !== 'undefined' && firebase.firestore && db && firebase.apps.length) {
    // Real-time Firestore snapshot listener
    db.collection('enquiries')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        allEnquiries = [];
        snapshot.forEach((doc) => {
          allEnquiries.push({
            id: doc.id,
            ...doc.data()
          });
        });
        updateMetrics();
        renderDashboardTable();
      }, (error) => {
        console.error("Firestore snapshot error:", error);
        loadLocalFallbackData();
      });
  } else {
    loadLocalFallbackData();
  }
}

/**
 * LocalStorage Fallback for offline testing
 */
function loadLocalFallbackData() {
  const stored = JSON.parse(localStorage.getItem('inora_enquiries') || '[]');
  allEnquiries = stored.map((item, idx) => ({
    id: `local_${idx}`,
    ...item
  }));
  updateMetrics();
  renderDashboardTable();
}

/**
 * Calculate & Update Metric Counters
 */
function updateMetrics() {
  const total = allEnquiries.length;
  const newCount = allEnquiries.filter(e => (e.status || 'NEW_ENQUIRY') === 'NEW_ENQUIRY').length;
  const quoteCount = allEnquiries.filter(e => e.formType === 'quote').length;
  const sourcingCount = allEnquiries.filter(e => e.formType === 'sourcing').length;
  const contactCount = allEnquiries.filter(e => e.formType === 'contact' || e.formType === 'product_enquiry').length;

  const totalEl = document.getElementById('stat-total-submissions');
  const newEl = document.getElementById('stat-new-enquiries');
  const quoteEl = document.getElementById('stat-quote-count');
  const sourcingEl = document.getElementById('stat-sourcing-count');
  const contactEl = document.getElementById('stat-contact-count');

  if (totalEl) totalEl.textContent = total;
  if (newEl) newEl.textContent = newCount;
  if (quoteEl) quoteEl.textContent = quoteCount;
  if (sourcingEl) sourcingEl.textContent = sourcingCount;
  if (contactEl) contactEl.textContent = contactCount;
}

/**
 * Filter & Render Enquiries Table
 */
function renderDashboardTable() {
  const tbody = document.getElementById('admin-table-body');
  if (!tbody) return;

  const search = currentSearchQuery.trim().toLowerCase();

  const filtered = allEnquiries.filter(item => {
    // Form Type Filter
    const matchesType = (currentFilterFormType === 'all') || (item.formType === currentFilterFormType);
    
    // Status Filter
    const itemStatus = item.status || 'NEW_ENQUIRY';
    const matchesStatus = (currentFilterStatus === 'all') || (itemStatus === currentFilterStatus);

    // Search Query Filter
    const matchesSearch = !search ||
      (item.fullName && item.fullName.toLowerCase().includes(search)) ||
      (item.companyName && item.companyName.toLowerCase().includes(search)) ||
      (item.email && item.email.toLowerCase().includes(search)) ||
      (item.country && item.country.toLowerCase().includes(search)) ||
      (item.productTitle && item.productTitle.toLowerCase().includes(search)) ||
      (item.message && item.message.toLowerCase().includes(search));

    return matchesType && matchesStatus && matchesSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem; color: var(--slate-light);">
          <i class="fas fa-inbox fa-2x" style="margin-bottom: 0.5rem;"></i><br>
          No enquiries matching current filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const formattedDate = formatDate(item.timestamp);
    const formTypeBadge = getFormTypeBadge(item.formType);
    const statusVal = item.status || 'NEW_ENQUIRY';
    const statusClass = statusVal === 'NEW_ENQUIRY' ? 'status-new' : statusVal === 'CONTACTED' ? 'status-contacted' : 'status-closed';

    return `
      <tr data-id="${item.id}">
        <td style="font-family: var(--font-mono); font-size: 0.8rem;">${formattedDate}</td>
        <td>
          <strong style="color: var(--white); font-size: 0.95rem;">${escapeHTML(item.fullName || 'N/A')}</strong><br>
          <span style="font-size: 0.78rem; color: var(--slate-light);">${escapeHTML(item.email || '')}</span>
        </td>
        <td>
          <span style="font-weight: 700; color: var(--white);">${escapeHTML(item.companyName || item.businessType || 'Direct Buyer')}</span><br>
          <span style="font-size: 0.75rem; color: var(--slate-light);">${escapeHTML(item.phone || '')}</span>
        </td>
        <td>
          <span style="color: var(--gold); font-weight: 700;">${escapeHTML(item.country || item.destinationPort || 'International')}</span>
        </td>
        <td>${formTypeBadge}</td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${escapeHTML(item.productTitle || item.message || 'No message details')}
        </td>
        <td>
          <select onchange="updateLeadStatus('${item.id}', this.value)" class="status-select ${statusClass}">
            <option value="NEW_ENQUIRY" ${statusVal === 'NEW_ENQUIRY' ? 'selected' : ''}>NEW_ENQUIRY</option>
            <option value="CONTACTED" ${statusVal === 'CONTACTED' ? 'selected' : ''}>CONTACTED</option>
            <option value="CLOSED" ${statusVal === 'CLOSED' ? 'selected' : ''}>CLOSED</option>
          </select>
        </td>
        <td style="text-align: center;">
          <button onclick="openLeadDetailModal('${item.id}')" class="btn btn-outline-gold" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
            <i class="fas fa-eye"></i> View
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Update Status in Firestore / LocalStorage
 */
async function updateLeadStatus(docId, newStatus) {
  try {
    if (typeof firebase !== 'undefined' && firebase.firestore && db && firebase.apps.length && !docId.startsWith('local_')) {
      await db.collection('enquiries').doc(docId).update({ status: newStatus });
      console.log(`Status updated for doc ${docId}:`, newStatus);
    } else {
      // LocalStorage fallback update
      const stored = JSON.parse(localStorage.getItem('inora_enquiries') || '[]');
      const index = docId.replace('local_', '');
      if (stored[index]) {
        stored[index].status = newStatus;
        localStorage.setItem('inora_enquiries', JSON.stringify(stored));
      }
    }
    
    // Update local state array & recalculate UI
    const target = allEnquiries.find(e => e.id === docId);
    if (target) target.status = newStatus;

    updateMetrics();
    renderDashboardTable();
    showToast(`Lead status updated to ${newStatus}`, "success");
  } catch (err) {
    console.error("Error updating lead status:", err);
    showToast("Failed to update status in database.", "error");
  }
}

/**
 * Open Modal with Full Lead Details
 */
function openLeadDetailModal(leadId) {
  const lead = allEnquiries.find(e => e.id === leadId);
  if (!lead) return;

  const modal = document.getElementById('lead-detail-modal');
  const nameEl = document.getElementById('modal-lead-name');
  const badgeEl = document.getElementById('modal-lead-formtype');
  const fieldsContainer = document.getElementById('modal-lead-fields');
  const messageEl = document.getElementById('modal-lead-message');
  const emailBtn = document.getElementById('modal-lead-email-btn');
  const waBtn = document.getElementById('modal-lead-wa-btn');

  if (nameEl) nameEl.textContent = lead.fullName || 'Valued Buyer';
  if (badgeEl) {
    badgeEl.textContent = (lead.formType || 'ENQUIRY').toUpperCase();
    badgeEl.className = `form-badge ${getBadgeClass(lead.formType)}`;
  }

  if (messageEl) messageEl.textContent = lead.message || 'No additional notes provided.';

  // Build key-value fields
  const fields = [
    { label: 'Full Name', val: lead.fullName },
    { label: 'Email Address', val: lead.email },
    { label: 'Phone / Mobile', val: lead.phone || 'N/A' },
    { label: 'Company / Firm', val: lead.companyName || lead.businessType || 'N/A' },
    { label: 'Country of Import', val: lead.country || 'N/A' },
    { label: 'Destination Port', val: lead.destinationPort || 'N/A' },
    { label: 'Product / Category', val: lead.productTitle || lead.productCategory || 'N/A' },
    { label: 'Quantity / Packaging', val: lead.quantity || lead.packagingSpec || 'N/A' },
    { label: 'Incoterms Preferred', val: lead.incoterm || 'FOB / CIF' },
    { label: 'Submitted Date', val: formatDate(lead.timestamp) }
  ];

  if (fieldsContainer) {
    fieldsContainer.innerHTML = fields.map(f => `
      <div class="detail-field">
        <div class="detail-label">${f.label}</div>
        <div class="detail-val">${escapeHTML(f.val || 'N/A')}</div>
      </div>
    `).join('');
  }

  // Update Action Buttons
  if (emailBtn) {
    emailBtn.href = `mailto:${lead.email}?subject=RE:%20INORA%20GLOBAL%20EXIM%20B2B%20Export%20Quotation%20Inquiry`;
  }
  if (waBtn) {
    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
    waBtn.href = cleanPhone ? `https://wa.me/${cleanPhone}` : `https://wa.me/917200819993?text=Hello%20${encodeURIComponent(lead.fullName || '')}`;
  }

  if (modal) modal.classList.add('active');
}

function closeLeadModal() {
  const modal = document.getElementById('lead-detail-modal');
  if (modal) modal.classList.remove('active');
}

/**
 * Export Filtered Enquiries to CSV File
 */
function exportEnquiriesCSV() {
  if (allEnquiries.length === 0) {
    showToast("No enquiries available to export.", "error");
    return;
  }

  const search = currentSearchQuery.trim().toLowerCase();
  const filtered = allEnquiries.filter(item => {
    const matchesType = (currentFilterFormType === 'all') || (item.formType === currentFilterFormType);
    const itemStatus = item.status || 'NEW_ENQUIRY';
    const matchesStatus = (currentFilterStatus === 'all') || (itemStatus === currentFilterStatus);
    const matchesSearch = !search ||
      (item.fullName && item.fullName.toLowerCase().includes(search)) ||
      (item.companyName && item.companyName.toLowerCase().includes(search)) ||
      (item.email && item.email.toLowerCase().includes(search)) ||
      (item.country && item.country.toLowerCase().includes(search));

    return matchesType && matchesStatus && matchesSearch;
  });

  const headers = ['Date', 'Form Type', 'Status', 'Full Name', 'Email', 'Phone', 'Company', 'Country', 'Destination Port', 'Product/Requirement', 'Quantity/Packaging', 'Message'];
  
  const rows = filtered.map(e => [
    formatDate(e.timestamp),
    e.formType || 'product_enquiry',
    e.status || 'NEW_ENQUIRY',
    e.fullName || '',
    e.email || '',
    e.phone || '',
    e.companyName || e.businessType || '',
    e.country || '',
    e.destinationPort || '',
    e.productTitle || e.productCategory || '',
    e.quantity || e.packagingSpec || '',
    (e.message || '').replace(/"/g, '""')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];

  link.href = url;
  link.setAttribute('download', `inora_b2b_enquiries_export_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Successfully exported ${filtered.length} leads to CSV`, "success");
}

// Helpers
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  }
  return 'Just now';
}

function getFormTypeBadge(type) {
  const badgeClass = getBadgeClass(type);
  const label = type === 'quote' ? 'Quote Request' : type === 'sourcing' ? 'Custom Sourcing' : type === 'contact' ? 'Contact Us' : 'Product Catalogue';
  return `<span class="form-badge ${badgeClass}">${label}</span>`;
}

function getBadgeClass(type) {
  switch (type) {
    case 'quote': return 'badge-quote';
    case 'sourcing': return 'badge-sourcing';
    case 'contact': return 'badge-contact';
    default: return 'badge-product';
  }
}

function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg, type = "info") {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === 'error' ? '#EF4444' : '#10B981'};
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    z-index: 3000;
    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    transition: opacity 0.3s ease;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   PRODUCT CATALOGUE CRUD MANAGEMENT
   ========================================================================== */

let adminProductsList = [];

// Initialize Products Firestore Listener
function initProductsAdmin() {
  if (typeof firebase !== 'undefined' && firebase.firestore && db) {
    db.collection('products').onSnapshot(async (snapshot) => {
      if (snapshot.empty) {
        // Seed default products if collection is brand new
        console.log("Seeding initial product catalogue into Firestore...");
        const defaultProds = typeof INORA_PRODUCTS !== 'undefined' ? INORA_PRODUCTS : [];
        for (const prod of defaultProds) {
          await db.collection('products').doc(prod.id).set(prod);
        }
      } else {
        adminProductsList = [];
        snapshot.forEach(doc => {
          adminProductsList.push({ docId: doc.id, ...doc.data() });
        });
        renderProductsAdminTable();
      }
    }, (err) => {
      console.error("Error loading products:", err);
    });
  }
}

// Section Switcher (Enquiries vs Products)
function switchAdminSection(section, element) {
  document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
  if (element) element.classList.add('active');

  const enquiriesSec = document.getElementById('section-enquiries');
  const productsSec = document.getElementById('section-products');
  const titleEl = document.getElementById('admin-current-section-title');
  const exportBtn = document.getElementById('export-csv-btn');

  if (section === 'products') {
    if (enquiriesSec) enquiriesSec.style.display = 'none';
    if (productsSec) productsSec.style.display = 'block';
    if (titleEl) titleEl.textContent = "LIVE PRODUCT CATALOGUE MANAGEMENT";
    if (exportBtn) exportBtn.style.display = 'none';
    initProductsAdmin();
  } else {
    if (productsSec) productsSec.style.display = 'none';
    if (enquiriesSec) enquiriesSec.style.display = 'block';
    if (titleEl) titleEl.textContent = "B2B ENQUIRIES & QUOTE LEADS";
    if (exportBtn) exportBtn.style.display = 'block';
  }
}

// Render Products Table
function renderProductsAdminTable() {
  const tbody = document.getElementById('products-crud-table-body');
  if (!tbody) return;

  if (adminProductsList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: var(--slate-light);">
          No export products found. Click <strong>ADD NEW PRODUCT</strong> above to create one.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminProductsList.map(prod => {
    const itemsText = Array.isArray(prod.items) ? prod.items.join(', ') : (prod.items || '-');
    const moqText = prod.specs ? (prod.specs.moq || 'Based on requirement') : 'Based on requirement';
    const imgUrl = prod.image || 'assets/images/logo-web.png';

    return `
      <tr>
        <td>
          <img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(prod.title)}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid var(--navy-border);">
        </td>
        <td>
          <strong style="color: var(--white); font-size: 0.9rem;">${escapeHTML(prod.title)}</strong>
          <div style="font-size: 0.75rem; color: var(--slate-light);">ID: ${escapeHTML(prod.id || prod.docId)}</div>
        </td>
        <td><span class="form-badge badge-product">${escapeHTML(prod.category)}</span></td>
        <td><strong style="color: var(--gold); font-size: 0.8rem;">${escapeHTML(prod.stampLabel || prod.category)}</strong></td>
        <td style="max-width: 200px; font-size: 0.8rem; color: var(--slate-light); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${escapeHTML(itemsText)}
        </td>
        <td style="font-size: 0.8rem; color: var(--slate-light);">
          MOQ: ${escapeHTML(moqText)}
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button onclick="openEditProductModal('${escapeHTML(prod.docId)}')" class="btn btn-navy" style="padding: 0.4rem 0.6rem; font-size: 0.75rem;" title="Edit Product">
              <i class="fas fa-edit text-gold"></i>
            </button>
            <button onclick="deleteProductItem('${escapeHTML(prod.docId)}')" class="btn btn-navy" style="padding: 0.4rem 0.6rem; font-size: 0.75rem; color: #EF4444;" title="Delete Product">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Modal Handlers
function openAddProductModal() {
  const form = document.getElementById('product-crud-form');
  if (form) form.reset();

  document.getElementById('pm-doc-id').value = '';
  document.getElementById('product-modal-title').innerHTML = '<i class="fas fa-box-open"></i> Add Export Product';
  document.getElementById('product-modal-overlay').classList.add('open');
}

function openEditProductModal(docId) {
  const prod = adminProductsList.find(p => p.docId === docId || p.id === docId);
  if (!prod) return;

  document.getElementById('pm-doc-id').value = prod.docId || prod.id;
  document.getElementById('pm-id').value = prod.id || '';
  document.getElementById('pm-stamp').value = prod.stampLabel || prod.category || '';
  document.getElementById('pm-title').value = prod.title || '';
  document.getElementById('pm-category').value = prod.category || '';
  document.getElementById('pm-description').value = prod.description || '';
  document.getElementById('pm-items').value = Array.isArray(prod.items) ? prod.items.join(', ') : (prod.items || '');
  document.getElementById('pm-image-url').value = prod.image || '';
  document.getElementById('pm-origin').value = prod.specs ? (prod.specs.origin || 'India') : 'India';
  document.getElementById('pm-packaging').value = prod.specs ? (prod.specs.packaging || '5kg, 10kg, 25kg, 50kg PP / Jute Bags') : '5kg, 10kg, 25kg, 50kg PP / Jute Bags';
  document.getElementById('pm-moq').value = prod.specs ? (prod.specs.moq || 'Based on buyer requirement') : 'Based on buyer requirement';
  document.getElementById('pm-capacity').value = prod.specs ? (prod.specs.capacity || 'Based on buyer requirement') : 'Based on buyer requirement';

  document.getElementById('product-modal-title').innerHTML = '<i class="fas fa-edit"></i> Edit Export Product';
  document.getElementById('product-modal-overlay').classList.add('open');
}

function closeProductModal() {
  const modal = document.getElementById('product-modal-overlay');
  if (modal) modal.classList.remove('open');
}

// Cloudinary File Upload Integration
async function handleProductCloudinaryUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const statusEl = document.getElementById('cloudinary-upload-status');
  const btn = document.getElementById('cloudinary-upload-btn');

  try {
    if (statusEl) statusEl.textContent = "Uploading photo to Cloudinary...";
    if (btn) btn.disabled = true;

    if (typeof uploadToCloudinary !== 'function') {
      throw new Error("Cloudinary service script not loaded.");
    }

    const result = await uploadToCloudinary(file);
    document.getElementById('pm-image-url').value = result.url;
    if (statusEl) statusEl.textContent = "Photo uploaded successfully!";
    showToast("Photo uploaded to Cloudinary!");
  } catch (err) {
    console.error("Upload error:", err);
    if (statusEl) statusEl.textContent = "Upload failed: " + err.message;
    showToast("Upload failed: " + err.message, "error");
  } finally {
    if (btn) btn.disabled = false;
  }
}

// Save Product Form Handler
document.addEventListener('DOMContentLoaded', () => {
  const prodForm = document.getElementById('product-crud-form');
  if (prodForm) {
    prodForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('save-product-submit-btn');

      const docId = document.getElementById('pm-doc-id').value.trim();
      const prodId = document.getElementById('pm-id').value.trim().toLowerCase().replace(/\s+/g, '-');
      const stampLabel = document.getElementById('pm-stamp').value.trim().toUpperCase();
      const title = document.getElementById('pm-title').value.trim();
      const category = document.getElementById('pm-category').value.trim().toUpperCase();
      const description = document.getElementById('pm-description').value.trim();
      const itemsRaw = document.getElementById('pm-items').value.trim();
      const items = itemsRaw.split(',').map(i => i.trim()).filter(Boolean);
      const image = document.getElementById('pm-image-url').value.trim();
      const origin = document.getElementById('pm-origin').value.trim();
      const packaging = document.getElementById('pm-packaging').value.trim();
      const moq = document.getElementById('pm-moq').value.trim();
      const capacity = document.getElementById('pm-capacity').value.trim();

      const payload = {
        id: prodId,
        stampLabel,
        title,
        category,
        description,
        items,
        image,
        specs: { origin, packaging, moq, capacity },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      try {
        if (submitBtn) submitBtn.disabled = true;

        const targetId = docId || prodId;
        await db.collection('products').doc(targetId).set(payload, { merge: true });

        showToast("Product catalog updated successfully!");
        closeProductModal();
      } catch (err) {
        console.error("Error saving product:", err);
        showToast("Failed to save product: " + err.message, "error");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});

// Delete Product
async function deleteProductItem(docId) {
  if (!confirm("Are you sure you want to delete this export product from the live catalog?")) return;

  try {
    await db.collection('products').doc(docId).delete();
    showToast("Product deleted from live catalog.");
  } catch (err) {
    console.error("Error deleting product:", err);
    showToast("Failed to delete product: " + err.message, "error");
  }
}
