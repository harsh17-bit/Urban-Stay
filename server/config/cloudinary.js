const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage engine for property images
const propertyStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "urban-stay/properties",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto" }]
    }
});

// Create storage engine for project images
const projectStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "urban-stay/projects",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
        transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto" }]
    }
});

// Create storage engine for user avatars
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "urban-stay/avatars",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }]
    }
});

// Multer upload instances
const uploadPropertyImages = multer({ 
    storage: propertyStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadProjectImages = multer({ 
    storage: projectStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadAvatar = multer({ 
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return false;
    }
};

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    if (!url || !url.includes("cloudinary")) return null;
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    // Get everything after 'upload/v{version}/' and remove extension
    const publicIdParts = parts.slice(uploadIndex + 2);
    const publicIdWithExt = publicIdParts.join("/");
    return publicIdWithExt.replace(/\.[^.]+$/, "");
};

module.exports = {
    cloudinary,
    uploadPropertyImages,
    uploadProjectImages,
    uploadAvatar,
    deleteImage,
    getPublicIdFromUrl
};
