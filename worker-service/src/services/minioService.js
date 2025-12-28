// worker-service/src/services/minioService.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

exports.uploadImage = async (fileBuffer, fileName, mimeType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'image-import-system',
        public_id: fileName.split('.')[0],
        quality: 'auto',  // Automatically compress (reduce size by ~60%)
        fetch_format: 'auto', // Convert to WebP/AVIF if possible (smaller files)
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        
        
        resolve({
          url: result.secure_url,    
          etag: result.etag,
          
         
          path: result.public_id,    
          key: result.public_id,        
          objectName: result.public_id, 
          name: result.public_id       
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};