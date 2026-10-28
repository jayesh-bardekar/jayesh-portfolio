const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
};

// Upload one cover image.
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    const result = await uploadToCloudinary(
      req.file,
      "jayesh-portfolio/projects"
    );

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully!",
      image: result,
    });
  } catch (error) {
    console.error("Image upload failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Image upload failed.",
    });
  }
};

// Upload multiple gallery images.
const uploadMultipleImages = async (req, res) => {
  const uploadedImages = [];

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one image.",
      });
    }

    for (const file of req.files) {
      const result = await uploadToCloudinary(
        file,
        "jayesh-portfolio/projects/gallery"
      );

      uploadedImages.push(result);
    }

    return res.status(200).json({
      success: true,
      message: "Gallery images uploaded successfully!",
      images: uploadedImages,
    });
  } catch (error) {
    // Clean up images uploaded earlier in this request if a later
    // upload fails.
    await Promise.allSettled(
      uploadedImages.map((image) =>
        cloudinary.uploader.destroy(image.publicId)
      )
    );

    console.error("Gallery upload failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to upload all gallery images.",
    });
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
};