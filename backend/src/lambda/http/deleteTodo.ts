import 'source-map-support/register';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as AWS  from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const todosTable = process.env.TODOS_TABLE;
const docClient = new AWS.DynamoDB.DocumentClient();

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const todoId = event.pathParameters.todoId;

      try {
        await docClient
          .delete({
            Key: {
              todoId: todoId
            },
            TableName: todosTable
          })
          .promise();

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
