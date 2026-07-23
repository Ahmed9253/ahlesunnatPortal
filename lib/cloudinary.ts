import { v2 as cloudinary } from 'cloudinary';

const configured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export function isCloudinaryConfigured() {
  return configured;
}

export async function uploadToCloudinary(file: Buffer, filename: string): Promise<string> {
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { public_id: filename, folder: 'ahlesunnat' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as { secure_url: string });
      }
    );
    uploadStream.end(file);
  });
  return result.secure_url;
}
