/* ==========================================================================
   INORA GLOBAL EXIM - Admin Authentication & Strict Route Guard
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Startup Firebase Configuration Self-Check on Login Page
  const errorEl = document.getElementById('login-error-msg');
  const isFirebaseConfigured = typeof firebase !== 'undefined' && 
                               firebase.apps && 
                               firebase.apps.length > 0 && 
                               typeof firebaseConfig !== 'undefined' && 
                               firebaseConfig.apiKey && 
                               !firebaseConfig.apiKey.includes("YOUR_");

  if (errorEl && !isFirebaseConfigured) {
    errorEl.style.display = 'block';
    errorEl.style.background = 'rgba(239, 68, 68, 0.2)';
    errorEl.style.borderColor = '#EF4444';
    errorEl.style.color = '#FCA5A5';
    errorEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <strong>Firebase Not Configured</strong><br><span style="font-size:0.8rem;">Please configure Firebase API credentials in <code>js/firebase.js</code>.</span>';
  }

  // Login Form Submission
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.textContent = "Please enter both email address and password.";
        }
        return;
      }

      if (!isFirebaseConfigured) {
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.textContent = "Firebase Authentication is not configured. Unable to log in.";
        }
        return;
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        }
        if (errorEl) errorEl.style.display = 'none';

        await firebase.auth().signInWithEmailAndPassword(email, password);
        window.location.href = 'dashboard.html';
      } catch (err) {
        console.error("Admin Auth error:", err);
        if (errorEl) {
          errorEl.style.display = 'block';
          let msg = "Failed to sign in. Please verify your admin credentials.";
          if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            msg = "Invalid email or password. Access denied.";
          } else if (err.message) {
            msg = err.message;
          }
          errorEl.textContent = msg;
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
 * Strict Firebase Auth Route Guard for Admin Dashboard
 */
function checkAuthRouteGuard() {
  if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length > 0) {
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
  if (typeof firebase !== 'undefined' && firebase.auth && firebase.apps.length > 0) {
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
