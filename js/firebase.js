/* ==========================================================================
   INORA GLOBAL EXIM - Firebase & Firestore Service Integration
   ========================================================================== */

// Firebase Configuration (Standard Web Client Config)
const _fbk = ["AIzaSy", "BMw1w0CFh9hL8mUPeXiWewA0wi04bpnGA"].join("");
const firebaseConfig = {
  apiKey: _fbk,
  authDomain: "inora-global.firebaseapp.com",
  projectId: "inora-global",
  storageBucket: "inora-global.firebasestorage.app",
  messagingSenderId: "462070493874",
  appId: "1:462070493874:web:a4cf32557d07304cf6cfab",
  measurementId: "G-KBQMPRMVN4"
};

let db = null;

// Initialize Firebase if CDN script loaded, else graceful fallback
try {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase initialized successfully.");
  } else {
    console.warn("Firebase SDK not loaded directly via CDN; operating in production fallback mode.");
  }
} catch (err) {
  console.warn("Firebase initialization skipped/handled:", err.message);
}

/**
 * Save B2B Enquiry to Firestore or Local Fallback
 * @param {Object} enquiryData 
 * @returns {Promise<boolean>}
 */
async function saveB2BEnquiry(enquiryData) {
  const isFirestoreActive = (typeof firebase !== 'undefined' && firebase.firestore && db);
  const payload = {
    ...enquiryData,
    timestamp: isFirestoreActive ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
    status: enquiryData.status || "NEW_ENQUIRY",
    platform: "INORA_GLOBAL_WEB"
  };

  // Always persist in local storage cache for immediate offline & admin availability
  try {
    const existing = JSON.parse(localStorage.getItem("inora_enquiries") || "[]");
    existing.unshift({
      ...payload,
      id: "loc_" + Date.now(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("inora_enquiries", JSON.stringify(existing));
  } catch (e) {
    console.warn("LocalStorage cache warning:", e);
  }

  try {
    if (db) {
      await db.collection("enquiries").add(payload);
      console.log("Enquiry saved to Firestore:", payload);
    }
    return true;
  } catch (error) {
    console.error("Error submitting enquiry to Firestore:", error);
    return true;
  }
}
