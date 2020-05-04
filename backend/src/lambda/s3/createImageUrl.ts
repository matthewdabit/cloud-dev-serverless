import 'source-map-support/register'
import * as AWS from 'aws-sdk'


const bucketName = process.env.TODOS_ATTACHMENT_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

export function createImageUrl(todoId: string) {
  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  });

  const s3Url = `https://${bucketName}.s3.amazonaws.com/${todoId}`;

  return {
    uploadUrl,
    s3Url
  }
}
