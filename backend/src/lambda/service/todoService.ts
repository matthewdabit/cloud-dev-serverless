import * as uuid from 'uuid'

import { TodosDB } from '../db/todoDB'
import {TodoItem} from "../../models/TodoItem";
import {CreateTodoRequest} from "../../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../../requests/UpdateTodoRequest";


const todosDB = new TodosDB();

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return todosDB.getUserTodos(userId)
}

export async function createTodo(userId: string, newTodo: CreateTodoRequest) {
  const newTodoItem: TodoItem = {
    todoId: uuid.v4(),
    userId: userId,
    createdAt: new Date().toISOString(),
    done: false,
    ...newTodo
  };
  console.log('creating new todo item', newTodoItem);

  await todosDB.createTodo(newTodoItem);

  return newTodoItem
}

export async function deleteTodo(todoId: string) {
  return await todosDB.deleteTodo(todoId)
}

export async function updateTodo(
  todoId: string,
  updatedTodo: UpdateTodoRequest
) {
  const updatedTodoItem = {
    TableName: todosDB.todosTable,
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


  return await todosDB.updateTodoItem(updatedTodoItem)
}

export async function updateTodoUploadUrl(
  todoId: string,
  attachmentUrl: string
) {
  const updatedTodoItem = {
    TableName: todosDB.todosTable,
    Key: {
      todoId: todoId
    },
    UpdateExpression: 'set attachmentUrl=:attachmentUrl',
    ExpressionAttributeValues: {
      ':attachmentUrl': attachmentUrl
    },
    ReturnValues: 'UPDATED_NEW'
  };
  console.log('updating TodoItem', updatedTodoItem);

  return await todosDB.updateTodoItem(updatedTodoItem)
}
