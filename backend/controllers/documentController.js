const Document = require("../models/Document");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

/* =========================================
   CLOUDINARY UPLOAD HELPER
========================================= */

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const isPDF = file.mimetype === "application/pdf";
    const resourceType = isPDF ? "raw" : "image";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "jayesh-portfolio/documents",
        resource_type: resourceType,

        public_id: isPDF
          ? `${Date.now()}-${file.originalname.replace(/\.pdf$/i, "")}.pdf`
          : undefined,

        use_filename: !isPDF,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType,
        });
      },
    );

    Readable.from(file.buffer).pipe(stream);
  });
};

/* =========================================
   CLOUDINARY DELETE HELPER
========================================= */

const deleteFromCloudinary = async (publicId, resourceType) => {
  if (!publicId) return;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: "upload",
  });
};

/* =========================================
   GET ALL DOCUMENTS
   Admin Only
========================================= */

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents.",
    });
  }
};

/* =========================================
   UPLOAD DOCUMENT
   Admin Only
========================================= */

const uploadDocument = async (req, res) => {
  let uploadedFile = null;

  try {
    const { title, category } = req.body;

    if (!title?.trim() || !category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Document title and category are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a document.",
      });
    }

    uploadedFile = await uploadToCloudinary(req.file);

    const isPDF = req.file.mimetype === "application/pdf";

    const document = await Document.create({
      title: title.trim(),
      category: category.trim(),
      fileName: req.file.originalname,
      fileUrl: uploadedFile.url,
      publicId: uploadedFile.publicId,
      resourceType: uploadedFile.resourceType,
      fileType: isPDF ? "pdf" : "image",
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully!",
      document,
    });
  } catch (error) {
    if (uploadedFile) {
      await deleteFromCloudinary(
        uploadedFile.publicId,
        uploadedFile.resourceType,
      ).catch(() => {});
    }

    console.error("Document upload error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Document upload failed.",
    });
  }
};

/* =========================================
   DELETE DOCUMENT
   Admin Only
========================================= */

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    await deleteFromCloudinary(document.publicId, document.resourceType);

    await document.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully!",
    });
  } catch (error) {
    console.error("Delete document error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete document.",
    });
  }
};

/* =========================================
   GET LATEST RESUME
   Public Access
========================================= */

const getResume = async (req, res) => {
  try {
    const resume = await Document.findOne({
      category: "Resume",
      fileType: "pdf",
    }).sort({
      createdAt: -1,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    return res.status(200).json({
      success: true,
      resume: {
        _id: resume._id,
        title: resume.title,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        updatedAt: resume.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get resume error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume.",
    });
  }
};

/* =========================================
   UPLOAD / REPLACE RESUME
   Admin Only
========================================= */

const uploadResume = async (req, res) => {
  let uploadedFile = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a Resume PDF.",
      });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Only PDF files are allowed for Resume.",
      });
    }

    // Upload new Resume to Cloudinary.
    uploadedFile = await uploadToCloudinary(req.file);

    // Find existing Resume.
    const existingResume = await Document.findOne({
      category: "Resume",
      fileType: "pdf",
    }).sort({
      createdAt: -1,
    });

    const resumeData = {
      title: "Jayesh Bardekar Resume",
      category: "Resume",
      fileName: req.file.originalname,
      fileUrl: uploadedFile.url,
      publicId: uploadedFile.publicId,
      resourceType: uploadedFile.resourceType,
      fileType: "pdf",
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    };

    let resume;

    if (existingResume) {
      // Preserve old Cloudinary details.
      const oldPublicId = existingResume.publicId;
      const oldResourceType = existingResume.resourceType;

      // Update existing MongoDB record.
      Object.assign(existingResume, resumeData);

      resume = await existingResume.save();

      // Delete old file only after successful DB update.
      if (oldPublicId !== uploadedFile.publicId) {
        await deleteFromCloudinary(oldPublicId, oldResourceType).catch(
          (error) => {
            console.error("Old Resume cleanup error:", error.message);
          },
        );
      }
    } else {
      // Create first Resume record.
      resume = await Document.create(resumeData);
    }

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully!",
      resume,
    });
  } catch (error) {
    // Remove new Cloudinary file if DB operation fails.
    if (uploadedFile) {
      await deleteFromCloudinary(
        uploadedFile.publicId,
        uploadedFile.resourceType,
      ).catch(() => {});
    }

    console.error("Resume upload error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Resume upload failed.",
    });
  }
};

/* =========================================
   EXPORT CONTROLLERS
========================================= */

module.exports = {
  getDocuments,
  uploadDocument,
  deleteDocument,
  getResume,
  uploadResume,
};
