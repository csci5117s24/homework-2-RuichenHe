import { useState } from 'react';
import TodoItem from '../common/TodoItem';
import CategoryItem from '../common/CategoryItem';
import '../common/style.css';
import React, { useContext } from 'react';
import UserInfoContext from '../UserInfoContext';
import { useLoaderData } from 'react-router-dom';
async function loader({ request }) {
    const todoRequest = fetch("/api/todos", {
        signal: request.signal,
        method: "GET",
        headers: {
          'userid': "",
        }
    });
    const categoryRequest = fetch("/api/categories", {
      signal: request.signal,
      method: "GET",
      headers: {
        'userid': "",
      }
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
  const userInfo = useContext(UserInfoContext);
  console.log(userInfo.userId);


  const [todos, setTODOs] = useState(tododata.data);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [addTODOButtonName, setAddTodoButtonName] = useState("Add TODO")
  const [addCategoryButtonName, setAddCategoryButtonName] = useState("Add Category")
  const [notification, setNotification] = useState({ message: '', visible: false });
  // eslint-disable-next-line
  const [newTODOCategory, setNewTODOCategory] = useState("");
  const status = "todo";
  

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
      category: newTODOCategory.trim() === "" ? [] : [newTODOCategory]
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
      setNewTODOCategory("");
    }
    setAddTodoButtonName("Added");
    const coin = await fetch("/api/coin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodo)
    });
    if (coin.ok){
      console.log(await coin.json());
    }
    setAddTodoButtonName("Add TODO");
  }

  const [categories, setCategories] = useState(categorydata.data);
  const [name, setName] = useState("");

  async function newCategory() {
    setAddCategoryButtonName("Waiting");
    if (name.trim() === "") {
      setNotification({ message: 'Category name is required.', visible: true });
      setTimeout(() => {
          setNotification({ message: '', visible: false });
      }, 3000); // Hides the notification after 3 seconds
      setAddCategoryButtonName("Add Category");
      return; // Exit the function
    }
    const result = await fetch("/api/category", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({name: name, userID: userInfo.userId})
    })
    if (result.ok) {
      if (todos){
        setCategories([...categories, await result.json()]);
      } else {
        setCategories([await result.json()]);
      }
      setName("");
    }
    setAddCategoryButtonName("Add Category");
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
      <div className="parent-container">
        <div className="category-section">
          <div className="category-form">
              <h4>
                New Category
              </h4>
              <input value={name} placeholder="New category" onChange={e=>setName(e.target.value)}></input>
              <button onClick={newCategory}>{addCategoryButtonName}</button>
          </div>
          <h1>
            Category:
          </h1>
          {categories && categories.filter(category => category.userid === userInfo.userId).map(category => <CategoryItem key={category.name} category={category} rootname="/todos/"></CategoryItem>)}
        </div>
        <div className="todo-section">
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
              <select value = {newTODOCategory} onChange={e=>setNewTODOCategory(e.target.value)}>
                <option value="">Select a category</option>
                {categories.filter(category => category.userid === userInfo.userId).map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button onClick={newTodo}>{addTODOButtonName}</button>
            </div>
            <h1>
              TODO:
            </h1>
            {notification.visible && <div className="notification">{notification.message}</div>}
            {todos && todos.filter(todo => todo.status === "todo").filter(todo => todo.userid === userInfo.userId).map(todo => <TodoItem key={todo.title} todo={todo} onStatusChange={handleStatusChange}></TodoItem>)}
        </div>
      </div>
    </div>
    
  );
}

export const Todo_Page = {
  path:"/todos",
  element:<App></App>,
  loader:loader
}