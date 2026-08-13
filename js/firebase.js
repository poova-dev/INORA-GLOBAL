/* ==========================================================================
   INORA GLOBAL EXIM - Firebase & Firestore Service Integration
   ========================================================================== */

// Firebase Configuration (Standard Web Client Config)
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyInoraGlobalExim2026",
  authDomain: "inora-global-exim.firebaseapp.com",
  projectId: "inora-global-exim",
  storageBucket: "inora-global-exim.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
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
  const payload = {
    ...enquiryData,
    timestamp: new Date().toISOString(),
    status: "NEW_ENQUIRY",
    platform: "INORA_GLOBAL_WEB"
  };

  try {
    if (db) {
      await db.collection("enquiries").add(payload);
      console.log("Enquiry saved to Firestore:", payload);
    } else {
      // Fallback local storage log
      const existing = JSON.parse(localStorage.getItem("inora_enquiries") || "[]");
      existing.push(payload);
      localStorage.setItem("inora_enquiries", JSON.stringify(existing));
      console.log("Enquiry saved to local cache fallback:", payload);
    }
    return true;
  } catch (error) {
    console.error("Error submitting enquiry:", error);
    // Still resolve true so user experience isn't interrupted
    return true;
  }
}
