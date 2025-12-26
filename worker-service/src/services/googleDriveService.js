const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_API_KEY;

exports.listImagesInFolder = async (folderId, maxImages) => {
    // MOCK MODE: If no API Key is set, return fake data so we can test the worker
    if (!API_KEY || API_KEY === 'PLACEHOLDER_FOR_NOW') {
        console.log("⚠️ No Google API Key found. Using MOCK data.");
        return [
            { id: 'mock-1', name: 'test-image-1.jpg', mimeType: 'image/jpeg' },
            { id: 'mock-2', name: 'test-image-2.png', mimeType: 'image/png' }
        ];
    }

    // REAL MODE
    const url = `https://www.googleapis.com/drive/v3/files`;
    const response = await axios.get(url, {
        params: {
            q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
            pageSize: Math.min(100, maxImages),
            key: API_KEY,
            fields: 'files(id, name, mimeType)'
        }
    });
    return response.data.files;
};

exports.downloadImage = async (fileId) => {
    if (!API_KEY || API_KEY === 'PLACEHOLDER_FOR_NOW') {
         // Return a minimal valid 1x1 pixel JPEG buffer for testing
         return Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
    }

    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return response.data;
};