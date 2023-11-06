const express = require('express');

const blobRouter = express.Router();
const { methodLogging } = require('../utils/logger');
const { upload } = require('../dbUtils/s3Operations');

blobRouter.post('/', upload.single('file'), async (req, res) => {
  methodLogging('POST', req);
  if (!req.file) {
    return res.json({ error: 'No file uploaded' });
  }
  const { file } = req;
  return res.status(200).json(file);
});

module.exports = { blobRouter };
