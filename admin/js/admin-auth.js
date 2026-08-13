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
          // Development / Offline Fallback session simulation
          if (email && password.length >= 6) {
            localStorage.setItem('inora_admin_session', JSON.stringify({ email, time: Date.now() }));
            window.location.href = 'dashboard.html';
          } else {
            throw new Error("Invalid password (minimum 6 characters).");
          }
        }
      } catch (err) {
        console.error("Admin Auth error:", err);
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.textContent = err.message || "Failed to sign in. Please verify credentials.";
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
 * Route Guard for Admin Dashboard
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
    // Offline / Local fallback check
    const session = localStorage.getItem('inora_admin_session');
    if (!session) {
      console.warn("No active admin session found; redirecting to login.html");
      window.location.href = 'login.html';
    } else {
      const data = JSON.parse(session);
      const userEmailEl = document.getElementById('admin-user-email');
      if (userEmailEl) userEmailEl.textContent = data.email || 'admin@inoraglobal.com';
    }
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
    localStorage.removeItem('inora_admin_session');
    window.location.href = 'login.html';
  }
}
