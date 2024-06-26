import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import TodoItem from '../common/TodoItem';
import CategoryItem from '../common/CategoryItem';

import UserInfoContext from '../UserInfoContext';
import React, { useContext } from 'react';
async function loader({ request }) {
    const todoRequest = fetch("/api/todos", {
        signal: request.signal,
        method: "GET",
    });
    const categoryRequest = fetch("/api/categories", {
      signal: request.signal,
      method: "GET",
    });
    const [result1, result2] = await Promise.all([todoRequest, categoryRequest]);
    if (result1.ok && result2.ok) {
      const [tododata,categorydata] = await Promise.all([result1.json(), result2.json()]);
      console.log({tododata, categorydata})
      return {tododata, categorydata}
    } else {
    // this is just going to trigger the 404 page, but we can fix that later :|
    throw new Response("ERROR");
    }
}

function App() {
  // eslint-disable-next-line
  const {tododata, categorydata} = useLoaderData();
  const [todos, setTODOs] = useState(tododata.data);
  // eslint-disable-next-line
  const [categories, setCategories] = useState(categorydata.data);
  const userInfo = useContext(UserInfoContext);
  const handleStatusChange = async (todoid, newStatus) => {
    try {
      const url = "/api/todo/" + todoid;
      const response = await fetch(url, {
          method: 'GET', // HTTP method
          headers: {
              'Content-Type': 'application/json', // Assuming JSON response
          },
      });
      if (response.ok) {
          const todoItem = await response.json(); // Parse the JSON response body
          const newTODOItem = {title: todoItem.todo.title, description: todoItem.todo.description, isDone: newStatus, category: todoItem.todo.category, userID: userInfo.userId, deadline:todoItem.todo.deadline};
          fetch("/api/todo/"+todoid, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(newTODOItem)
          })
          setTODOs(todos.filter(todo => todo._id !== todoid));
      } else {
          console.error("Failed to fetch todo item with id:", todoid);
      }
    } catch (error) {
        console.error("Error fetching todo item:", error);
    }
  };

  return (
    <div>
      <div className="parent-container">
        <div className="category-section color1">
          <h1 className="color4">
            Category:
          </h1>
          {categories && categories.filter(category => category.userid === userInfo.userId).map(category => <CategoryItem key={category.name} category={category} rootname="/done/"></CategoryItem>)}
        </div>
        <div className="todo-section color2-back">
            <h1 className='color9'>
              DONE:
            </h1>
            {todos && todos.filter(todo => todo.userid === userInfo.userId).filter(todo => todo.status === "done").map(todo => <TodoItem key={todo.title} todo={todo} onStatusChange={handleStatusChange}></TodoItem>)}
        </div>
      </div>
    </div>
  );
}

export const Done_Page = {
  path:"/done",
  element:<App></App>,
  loader:loader
}