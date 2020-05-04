import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {UpdateTodoRequest} from '../../requests/UpdateTodoRequest'
import * as middy from 'middy';
import {cors} from 'middy/middlewares';
import {updateTodo} from "../service/todoService";


export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const todoId = event.pathParameters.todoId;
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

      try {
          await updateTodo(todoId, updatedTodo);
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
              item: updatedTodo
            })
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
    credentials: true
  })
);
