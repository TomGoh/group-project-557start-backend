const { S3, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const dotenv = require('dotenv');
const multerS3 = require('multer-s3');
const multer = require('multer');

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

async function retrieveImage(imageKey) {
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

const S3Storage = multerS3({
  s3,
  bucket: process.env.BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldname: file.fieldname });
  },
  key: (req, file, cb) => {
    const fileName = `${Date.now()}_${file.fieldname}_${file.originalname}`;
    cb(null, fileName);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
});

const upload = multer({
  storage: S3Storage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|webp|mp4)$/)) {
      return cb({
        message: 'Unsupported File Type',
        status: 415,
      }, false);
    }
    return cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = {
  imageUpload,
  retriveImage: retrieveImage,
  imageDelete,
  upload,
};
