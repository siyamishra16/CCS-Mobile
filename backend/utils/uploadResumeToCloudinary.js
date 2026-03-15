// const cloudinary = require("../config/cloudinary");
// const streamifier = require("streamifier");

// const uploadResumeToCloudinary = (buffer) => {
//     return new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//             {
//                 folder: "ccs/resumes",
//                 resource_type: "raw", // 🔥 REQUIRED
//                 use_filename: true,
//                 unique_filename: true,
//             },
//             (error, result) => {
//                 if (error) {
//                     console.error("Resume upload error:", error);
//                     reject(error);
//                 } else {
//                     resolve(result);
//                 }
//             }
//         );

//         streamifier.createReadStream(buffer).pipe(stream);
//     });
// };

// module.exports = uploadResumeToCloudinary;


const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadResumeToCloudinary = (buffer, originalName, mimetype) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "ccs/resumes",
                resource_type: "raw",

                // ⭐ KEY PART
                use_filename: true,
                unique_filename: false,
                overwrite: false,
                content_type: mimetype,            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

module.exports = uploadResumeToCloudinary;
