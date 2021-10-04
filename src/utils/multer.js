const multer = require('multer');
const { imgFolder } = require('../config');

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) =>{
    cb(null, imgFolder);
  },
  filename: (req, file, cb) =>{
    cb(null, file.originalname);
  }
});

const upload = multer({storage: storageConfig});

module.exports = upload;