import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import * as AWS  from 'aws-sdk';



const todosTable = process.env.TODOS_TABLE;
const docClient = new AWS.DynamoDB.DocumentClient();


export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const todoId = event.pathParameters.todoId;
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

      try {
          const updatedTodoItem = {
            TableName: todosTable,
            Key: {
              todoId: todoId
            },
            ExpressionAttributeNames: { '#name': 'name' },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
              ':name': updatedTodo.name,
              ':dueDate': updatedTodo.dueDate,
              ':done': updatedTodo.done
            },
            ReturnValues: 'UPDATED_NEW'
          };
          await docClient.update(updatedTodoItem).promise();

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
