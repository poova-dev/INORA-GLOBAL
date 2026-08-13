/* ==========================================================================
   INORA GLOBAL EXIM - Cloudinary Media Upload Service
   Upload Preset: tgixhf95 (Unsigned)
   ========================================================================== */

const CLOUDINARY_CONFIG = {
  cloudName: "tgixhf95",
  uploadPreset: "tgixhf95",
  uploadUrl: "https://api.cloudinary.com/v1_1/tgixhf95/auto/upload"
};

/**
 * Upload Image, Video, or PDF Specification Document to Cloudinary
 * @param {File} fileObject - Browser File object from input[type=file]
 * @returns {Promise<{url: string, publicId: string, format: string}>}
 */
async function uploadToCloudinary(fileObject) {
  if (!fileObject) {
    throw new Error("No file selected for Cloudinary upload.");
  }

  const formData = new FormData();
  formData.append("file", fileObject);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

  try {
    const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Cloudinary upload failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    console.log("Cloudinary Upload Success:", data.secure_url);
    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}
