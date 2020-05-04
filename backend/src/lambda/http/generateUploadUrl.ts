import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

const bucketName = process.env.TODOS_ATTACHMENT_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const todosTable = process.env.TODOS_TABLE;

const s3 = new AWS.S3({
  signatureVersion: 'v4'
});
const docClient = new AWS.DynamoDB.DocumentClient();



export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const { uploadUrl, s3Url } = createImageUrl(todoId);

    try {
        const updatedTodoItem = {
          TableName: todosTable,
          Key: {
            todoId: todoId
          },
          UpdateExpression: 'set attachmentUrl=:attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': s3Url
          },
          ReturnValues: 'UPDATED_NEW'
        };
        await docClient.update(updatedTodoItem).promise();

        return {
          statusCode: 200,
          body: JSON.stringify({
            uploadUrl
          })
        }
      } catch (error) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: `Unable to upload image for todo ${todoId}`
          })
        }
      }
  }
);


function createImageUrl(todoId: string) {
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

handler.use(
  cors({
    credentials: true
  })
);
