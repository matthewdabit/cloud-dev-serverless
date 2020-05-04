import 'source-map-support/register';

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';

import {CreateTodoRequest} from '../../requests/CreateTodoRequest';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import * as middy from 'middy';
import {cors} from 'middy/middlewares';

import {parseUserId} from "../../auth/utils";

const todosTable = process.env.TODOS_TABLE;
const docClient = new AWS.DynamoDB.DocumentClient();


export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
          const parsedBody: CreateTodoRequest = JSON.parse(event.body);
          const authorization = event.headers.Authorization;
          const split = authorization.split(' ');
          const jwtToken = split[1];
          const newTodo = {
                id: uuid.v4(),
                userId: parseUserId(jwtToken),
                createdAt: new Date().toISOString(),
                done: false,
                ...parsedBody
          };
          try {
              await docClient.put({
                    TableName: todosTable,
                    Item: newTodo
              }).promise();
    
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
                console.log('Failed to update todo ', e)
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
