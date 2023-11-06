const { S3, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const dotenv = require('dotenv');

dotenv.config();

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.ACCESS_ID,
    secretAccessKey: process.env.SECRET,
  },
    region: process.env.REGION,
});

async function imageUpload(image, imageKey) {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: imageKey,
    Body: image,
  };
  const data = await new Upload({
    client: s3,
    params,
  }).done();
  return data;
}

async function retriveImage(imageKey) {
  const getCommand = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: imageKey,
  });
  const data = await s3.send(getCommand);
  return data;
}

async function imageDelete(imageKey) {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: imageKey,
  });

  const data = await s3.send(deleteCommand);
  return data;
}

module.exports = {
  imageUpload,
  retriveImage,
  imageDelete,
};
