import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (buffer, fileName, mimeType, type = "video") => {
  const folder = type === "thumbnail" ? "thumbnails" : "videos";
  const key = `${folder}/${Date.now()}-${fileName}`;

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read',
    },
  });

  const result = await upload.done();

  return {
    Location: result.Location,
    Key: result.Key,
  };
};
