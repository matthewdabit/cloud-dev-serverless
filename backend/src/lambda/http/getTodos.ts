import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import {getUserId} from "../../auth/utils";
import * as AWS  from 'aws-sdk';
import {TodoItem} from "../../models/TodoItem";


const todosTable = process.env.TODOS_TABLE;
const userIdIndex = process.env.USER_ID_INDEX;
const docClient = new AWS.DynamoDB.DocumentClient();


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);
  const todos = await getTodosForUser(userId);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todos
    })
  }
};

async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  const result = await docClient.query({
    TableName: todosTable,
    IndexName: userIdIndex,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false
  }).promise();

  return result.Items as TodoItem[]
}
