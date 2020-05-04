import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy';
import {cors} from 'middy/middlewares';
import {createImageUrl} from "../s3/createImageUrl";
import {updateTodoUploadUrl} from "../service/todoService";


export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const { uploadUrl, s3Url } = createImageUrl(todoId);

    try {
        await updateTodoUploadUrl(todoId, s3Url);

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
