const aws = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

const region = "ca-central-1";
const bucketName = "listify-direct-upload-image";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

let imageIndex = 0;


const s3 = new aws.S3({
    signatureVersion: 'v4',
    region: 'ca-central-1',
    accessKeyId,
    secretAccessKey,
});

async function generateUploadURL(maxIndex) {
    const imageName = "image" + maxIndex;
    // const imageName = "image" + imageIndex.toString();
    console.log("s3.js maxIndex: " + imageName);

    const params = ({
        Bucket: bucketName,
        Key: imageName,
        Expires: 60,
    });

    const uploadURL = await s3.getSignedUrlPromise('putObject', params);
    return uploadURL;
}

exports.generateUploadURL = generateUploadURL;