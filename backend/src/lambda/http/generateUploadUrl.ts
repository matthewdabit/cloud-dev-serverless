import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import {createImageUrl} from "../s3/createImageUrl";

const todosTable = process.env.TODOS_TABLE;

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




handler.use(
  cors({
    credentials: true
  })
);
