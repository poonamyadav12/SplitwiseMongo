import { S3 } from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

const s3 = new S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
}

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3,
    bucket: 'splitwise-images/images',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: 'SplitwiseImage' });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
});

const singleUpload = upload.single('image');

export function uploadImage(req, res) {
  singleUpload(req, res, function (err) {
    if (err) {
      return res.status(422).send({ errors: [{ title: 'Image Upload Error', detail: err.message }] });
    }

    return res.json({ 'imageUrl': req.file.location });
  });
}
