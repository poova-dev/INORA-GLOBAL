/* ==========================================================================
   INORA GLOBAL EXIM - Admin Authentication & Route Guard
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Login Form Submission
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value;
      const errorEl = document.getElementById('login-error-msg');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.textContent = "Please enter both email address and password.";
        }
        return;
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        }
        if (errorEl) errorEl.style.display = 'none';

        if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
          await firebase.auth().signInWithEmailAndPassword(email, password);
          window.location.href = 'dashboard.html';
        } else {
          throw new Error("Authentication service is unavailable. Please check your network connection.");
        }
      } catch (err) {
        console.error("Admin Auth error:", err);
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.textContent = err.message || "Failed to sign in. Please verify your admin credentials.";
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'SIGN IN TO DASHBOARD <i class="fas fa-arrow-right"></i>';
        }
      }
    });
  }

  // Dashboard Route Guard Check
  const dashboardPage = document.getElementById('admin-dashboard-page');
  if (dashboardPage) {
    checkAuthRouteGuard();
  }
});

/**
 * Strict Route Guard for Admin Dashboard
 */
function checkAuthRouteGuard() {
  if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        console.warn("Unauthenticated admin access attempt; redirecting to login.html");
        window.location.href = 'login.html';
      } else {
        const userEmailEl = document.getElementById('admin-user-email');
        if (userEmailEl) userEmailEl.textContent = user.email;
      }
    });
  } else {
    console.error("Firebase Auth not initialized. Access denied.");
    window.location.href = 'login.html';
  }
}

/**
 * Admin Sign Out
 */
function handleAdminLogout() {
  if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length) {
    firebase.auth().signOut().then(() => {
      window.location.href = 'login.html';
    }).catch(err => {
      console.error("Error signing out:", err);
      window.location.href = 'login.html';
    });
  } else {
    window.location.href = 'login.html';
  }
}
