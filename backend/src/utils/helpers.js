const sanitizeInput = (input, maxLength = 255) => {
    if (typeof input !== 'string') return input;
    return input
        .substring(0, maxLength)
        .replace(/[<>]/g, '')
        .trim();
};

const getFullUrl = (req, path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Check if it's already a full URL
    if (path.startsWith('/uploads')) {
        // Determine the base URL based on request
        const protocol = req.protocol;
        const host = req.get('host');
        return `${protocol}://${host}${path}`;
    }

    return path;
};

module.exports = {
    sanitizeInput,
    getFullUrl
};
