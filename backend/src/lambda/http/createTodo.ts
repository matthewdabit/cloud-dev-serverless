import 'source-map-support/register';

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {CreateTodoRequest} from '../../requests/CreateTodoRequest';
import * as middy from 'middy';
import {cors} from 'middy/middlewares';

import {getUserId} from "../../auth/utils";
import {createTodo} from "../service/todoService";


export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
          const parsedBody: CreateTodoRequest = JSON.parse(event.body);

          try {
              const newTodo = await createTodo(getUserId(event), parsedBody);

              return {
                    statusCode: 201,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Credentials': true
                    },
                    body: JSON.stringify({
                        item: newTodo
                    })
              };
          } catch (e) {
                console.log('Failed to update todo ', e);
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
