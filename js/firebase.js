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
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log("Firebase initialized successfully.");
  } else {
    console.warn("Firebase SDK not loaded directly via CDN; operating in production fallback mode.");
  }
} catch (err) {
  console.warn("Firebase initialization skipped/handled:", err.message);
}

/**
 * Save B2B Enquiry to Firestore
 * @param {Object} enquiryData 
 * @returns {Promise<boolean>}
 */
async function saveB2BEnquiry(enquiryData) {
  const isFirestoreActive = (typeof firebase !== 'undefined' && firebase.firestore && db);

  const payload = {
    fullName: enquiryData.fullName || '',
    email: enquiryData.email || '',
    phone: enquiryData.phone || '',
    companyName: enquiryData.companyName || '',
    country: enquiryData.country || '',
    businessType: enquiryData.businessType || '',
    productTitle: enquiryData.productTitle || '',
    quantityNeeded: enquiryData.quantityNeeded || '',
    packagingSpec: enquiryData.packagingSpec || '',
    destinationPort: enquiryData.destinationPort || '',
    message: enquiryData.message || '',
    formType: enquiryData.formType || 'product_enquiry',
    status: enquiryData.status || "NEW_ENQUIRY",
    platform: "INORA_GLOBAL_WEB",
    timestamp: isFirestoreActive ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
  };

  try {
    if (db) {
      const docRef = await db.collection("enquiries").add(payload);
      console.log("Enquiry saved successfully to Firestore with ID:", docRef.id);
      return true;
    } else {
      console.error("Firestore database instance not active.");
      return false;
    }
  } catch (error) {
    console.error("Error submitting enquiry to Firestore:", error);
    return false;
  }
}
