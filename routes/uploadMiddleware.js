const multer = require("multer");
const path = require("path");
// Handle the storage of the images in the uploads folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// complete the upload function to set the limit to 5 MB and set the storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});
//This function decides whether to accept or reject the uploaded file based on conditions (like file type).
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}
// path.extname(file.originalname) extracts the file’s extension, e.g., .jpg.
//.toLowerCase() ensures case-insensitivity (.JPG → .jpg).
//filetypes.test() checks if the extension matches allowed ones.



module.exports = upload;
