/* ==========================================================================
   INORA GLOBAL EXIM - B2B Enquiry Form & Quote Processor
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Bind all enquiry & quote forms
  const forms = document.querySelectorAll('.inora-enquiry-form, #quote-form, #sourcing-form, #contact-form');

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honey-pot spam check
      const honeypot = form.querySelector('input[name="website_url_check"]');
      if (honeypot && honeypot.value !== '') {
        console.warn("Spam bot submission blocked.");
        return;
      }

      // Collect form data into object
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        if (key !== 'website_url_check') {
          data[key] = value.trim();
        }
      });

      // Simple validation
      if (!data.fullName || !data.email || !data.message) {
        showToast("Please fill in all required fields marked with *", "error");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        showToast("Please enter a valid email address.", "error");
        return;
      }

      // Submit Button Loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'SUBMIT ENQUIRY';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting...`;
      }

      try {
        const success = await saveB2BEnquiry(data);
        if (success) {
          form.reset();
          showSuccessModal(data.fullName || "Valued Buyer");
        } else {
          showToast("Could not submit enquiry. Please try again or WhatsApp us directly.", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Submission error. Please check internet connection.", "error");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  });
});

/**
 * Show Success Feedback Modal
 * @param {string} buyerName 
 */
function showSuccessModal(buyerName) {
  let modal = document.getElementById('success-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'success-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box">
        <div class="modal-icon"><i class="fas fa-check"></i></div>
        <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--white); margin-bottom: 0.5rem;">Enquiry Received!</h3>
        <p style="color: var(--slate-light); font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.6;">
          Thank you, <strong style="color: var(--gold);">${buyerName}</strong>. Our export trade specialists at INORA GLOBAL EXIM will review your requirements and respond within 24 business hours with specifications and pricing.
        </p>
        <button onclick="closeSuccessModal()" class="btn btn-gold" style="width: 100%;">
          ACKNOWLEDGE & CLOSE
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    const modalText = modal.querySelector('strong');
    if (modalText) modalText.textContent = buyerName;
  }

  setTimeout(() => {
    modal.classList.add('active');
  }, 50);
}

function closeSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (modal) modal.classList.remove('active');
}

/**
 * Simple Toast Notification Helper
 */
function showToast(message, type = "info") {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'error' ? '#EF4444' : '#10B981'};
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    z-index: 3000;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    transition: opacity 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
