import * as AWS from 'aws-sdk'
import {TodoItem} from "../../models/TodoItem";


export class TodosDB {
  constructor(
    private readonly docClient = new AWS.DynamoDB.DocumentClient(),
    public readonly todosTable = process.env.TODOS_TABLE,
    public readonly userIdIndex = process.env.USER_ID_INDEX
  ) {}

  async getUserTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    return result.Items as TodoItem[]
  }

  async createTodo(newTodoItem: TodoItem) {
    return await this.docClient
      .put({
        TableName: this.todosTable,
        Item: newTodoItem
      })
      .promise()
  }

  async deleteTodo(todoId: string) {
    await this.docClient
      .delete({
        Key: {
          todoId: todoId
        },
        TableName: this.todosTable
      })
      .promise()
  }

  async updateTodoItem(updatedTodoItem) {
    return this.docClient.update(updatedTodoItem).promise()
  }
}

