import axios from 'axios';
import { eventService } from '../api/event';

// Uploads event banner assets (image/portrait/video) directly to storage
// (S3 or Cloudinary) so large files never pass through our own API and hit
// the serverless function's request-body size limit. Returns the final
// URLs to send to the create/update endpoint instead of the raw files.
export async function uploadEventBannerAssets(filesByField) {
  const entries = Object.entries(filesByField).filter(([, file]) => !!file);
  if (entries.length === 0) return {};

  const { data } = await eventService.generatePresignedUrl({
    files: entries.map(([, file]) => ({ file_name: file.name, file_type: file.type })),
  });

  const presignedList = data.urls;
  const result = {};

  for (let i = 0; i < entries.length; i++) {
    const [field, file] = entries[i];
    result[field] = await uploadSingleFile(file, presignedList[i]);
  }

  return result;
}

async function uploadSingleFile(file, info) {
  if (info.provider === 'cloudinary') {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(info.fields).forEach(([key, value]) => formData.append(key, value));
    const { data } = await axios.post(info.presigned_url, formData);
    return data.secure_url;
  }

  if (info.provider === 's3') {
    await axios.put(info.presigned_url, file, { headers: { 'Content-Type': file.type } });
    return info.full_url;
  }

  // Local dev proxy (no Cloudinary/S3 configured)
  const { data } = await axios.put(info.presigned_url, file, {
    headers: { 'Content-Type': file.type },
  });
  return data?.url || info.full_url;
}
