const hostname = window.location.hostname;
const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

// Auto-detect backend URL
export const SERVER_URL = isLocalhost
    ? "http://localhost:5000"
    : `http://${hostname}:5000`;

export const API_BASE = `${SERVER_URL}/api`;

export const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/400x400?text=No+Image";

    // If already a full URL, return as is
    if (imagePath.startsWith("http")) return imagePath;

    // Convert relative path to full URL
    if (imagePath.startsWith("/uploads")) {
        return `${SERVER_URL}${imagePath}`;
    }

    // Just a filename - assume it's in uploads/products
    if (imagePath && !imagePath.includes("/")) {
        return `${SERVER_URL}/uploads/products/${imagePath}`;
    }

    return imagePath;
};
