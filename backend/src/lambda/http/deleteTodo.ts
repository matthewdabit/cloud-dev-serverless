import 'source-map-support/register';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {deleteTodo} from "../service/todoService";


export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const todoId = event.pathParameters.todoId;

      try {
        await deleteTodo(todoId);
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: ''
        }
      } catch (error) {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: ''
        }
      }
    }
);

handler.use(
    cors({
      credentials: true,
    })
);
