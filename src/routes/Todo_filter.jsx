import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import TodoItem from '../common/TodoItem';
import { Link, Outlet } from 'react-router-dom';
import '../common/style.css';
import React, { useContext } from 'react';
import UserInfoContext from '../UserInfoContext';

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
  const userInfo = useContext(UserInfoContext);
  const {todosList, category} = useLoaderData();
  const [todos, setTODOs] = useState(todosList.data);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const status = "todo";
  const [addTODOButtonName, setAddTodoButtonName] = useState("Add TODO")
  const [notification, setNotification] = useState({ message: '', visible: false });
  console.log("Category");
  console.log(category);
  async function newTodo() {
    setAddTodoButtonName("Waiting");
    if (title.trim() === "") {
      setNotification({ message: 'Title is required.', visible: true });
      setTimeout(() => {
          setNotification({ message: '', visible: false });
      }, 3000); // Hides the notification after 3 seconds
      setAddTodoButtonName("Add TODO");
      return; // Exit the function
    } else if (description.trim() === ""){
      setNotification({ message: 'Description is required.', visible: true });
      setTimeout(() => {
          setNotification({ message: '', visible: false });
      }, 3000); // Hides the notification after 3 seconds
      setAddTodoButtonName("Add TODO");
      return; // Exit the function
    }
    const newTodo = {
      title: title, 
      description: description, 
      status: status,
      userID: userInfo.userId,
      category: [category]
    }

    const result = await fetch("/api/todo", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodo)
    })
    if (result.ok) {
      if (todos){
        setTODOs([...todos, await result.json()]);
      } else {
        setTODOs([await result.json()]);
      }
      setTitle("");
      setDescription("");
    }
    setAddTodoButtonName("Add TODO");
  }
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
              const newTODOItem = {title: todoItem.todo.title, description: todoItem.todo.description, isDone: newStatus, category: todoItem.todo.category, userID: todoItem.todo.userID}
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
        <div className="todo-form">
          <h4>
            New TODO
          </h4>
          <input value={title} placeholder="New todo" onChange={e=>setTitle(e.target.value)}></input>
          <textarea 
              value={description} 
              placeholder="TODO description" 
              onChange={e => setDescription(e.target.value)}
              className="todo-description"
          ></textarea>
          <button onClick={newTodo}>{addTODOButtonName}</button>
        </div>
        {notification.visible && <div className="notification">{notification.message}</div>}
        <h1>
          TODO:
        </h1>
        {todos && todos.filter(todo => todo.status === "todo").filter(todo => todo.userid === userInfo.userId).map(todo => <TodoItem key={todo.title} todo={todo} onStatusChange={handleStatusChange}></TodoItem>)}
        <div className='bottom-button-container'>
          <Link to={`/done/${category}`} className='bottom-link-done'>{category} DONE List</Link>
          <Outlet />
        </div>
    </div>
    
  );
  
}

export const Todo_Filtered_Page = {
  path:"/todos/:category",
  element:<App></App>,
  loader:loader
}