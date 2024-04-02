import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import TodoItem from '../common/TodoItem';
import { Link, Outlet } from 'react-router-dom';
import '../common/style.css';
async function loader({ request, params }) {
  const { category } = params;
  const result = await fetch("/api/todos/"+category, {
    signal: request.signal,
    method: "get",
  });
  if (result.ok) {
    const todosList = await result.json();
    return { todosList, category };
  } else {
    // this is just going to trigger the 404 page, but we can fix that later :|
    throw new Response("ERROR", { status: result.status });
  }
}

function App() {
  // eslint-disable-next-line
  const {todosList, category} = useLoaderData();
  const [todos, setTODOs] = useState(todosList.data);
  console.log("Category");
  console.log(category);

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
              console.log(todoItem.todo.title); // Log the todo item for debugging
              console.log(newStatus);
              const newTODOItem = {title: todoItem.todo.title, description: todoItem.todo.description, isDone: newStatus, category: todoItem.todo.category}
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
        <h1>
          {category}
        </h1>
        <h1>
            DONE:
        </h1>
        {todos && todos.filter(todo => todo.status === "done").map(todo => <TodoItem key={todo.title} todo={todo} onStatusChange={handleStatusChange}></TodoItem>)}
        <div className='bottom-button-container'>
          <Link to={`/todos/${category}`} className='bottom-link-todo'>{category} TODO List</Link>
          <Outlet />
        </div>
    </div>
  );
  
}

export const Done_Filtered_Page = {
  path:"/done/:category",
  element:<App></App>,
  loader:loader
}