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
