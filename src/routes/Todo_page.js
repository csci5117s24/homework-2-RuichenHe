import { useState } from 'react';
import TodoItem from '../common/TodoItem';
import CategoryItem from '../common/CategoryItem';
import '../common/style.css';
import React, { useContext } from 'react';
import UserInfoContext from '../UserInfoContext';
import { useLoaderData } from 'react-router-dom';

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import addNotification from 'react-push-notification';

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

  const [selectedDate, setSelectedDate] = useState("");

  const handleDateChange = (date) => {
    setSelectedDate(date);
  }
  

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
    try {
      if (selectedDate.trim() === ""){
        setNotification({ message: 'Deadline date is required.', visible: true });
        setTimeout(() => {
            setNotification({ message: '', visible: false });
        }, 3000); // Hides the notification after 3 seconds
        setAddTodoButtonName("Add TODO");
        return; // Exit the function
      }
    } catch (error) {
      console.error("Error fetching todo item:", error);
    }
    const formattedDate = selectedDate.toISOString();
    console.log(selectedDate);
    const newTodo = {
      title: title, 
      description: description, 
      status: status, 
      deadline: formattedDate,
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
      const newlyAddedTODO = await result.json();
      if (todos){
        setTODOs([newlyAddedTODO, ...todos]);
      } else {
        setTODOs([newlyAddedTODO]);
      }
      setTitle("");
      setDescription("");
      setNewTODOCategory("");
      setSelectedDate("");

      // A small test for push notification
      //Based on the test, this notification implementation only wokrs on macbook safari.
      //Fail to create notification on Windows Edge, any browser on iphone, and Macbook Chrome.
      console.log(newlyAddedTODO)
      addNotification({
        title: 'New TODo item created',
        message: 'click to visit/modify',
        duration: 5000,
        native: true,
        onClick: () => window.location = "/todo/" + newlyAddedTODO._id,
      });

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
      if (categories){
        setCategories([await result.json(), ...categories]);
      } else {
        setCategories([await result.json()]);
      }
      setName("");
    }
    setAddCategoryButtonName("Add Category");
  }

  const handleCategoryDelete = async (categoryName) => {
    const userConfirmed = window.confirm("Are you sure you want to delete category: " + categoryName);
    if (userConfirmed) {
      console.log("process");
      setNotification({ message: 'Deleting category in progress...', visible: true });

      await fetch("/api/category/"+categoryName, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json",
          }
      })
      
      setCategories(categories.filter(category => category.name !== categoryName));

      setNotification({ message: 'Category deleted!', visible: true });
      setTimeout(() => {
          setNotification({ message: '', visible: false });
      }, 3000); // Hides the notification after 3 seconds
    } else {
      console.log(categoryName);
    }
    
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
          <div className="category-form color2-back">
              <h4 className="color5">
                New Category
              </h4>
              <input value={name} placeholder="New category" onChange={e=>setName(e.target.value)} className='color5'></input>
              <button onClick={newCategory}>{addCategoryButtonName}</button>
          </div>
          <h1 className="color4">
            Category:
          </h1>
          {categories && categories.filter(category => category.userid === userInfo.userId).map(category => <CategoryItem key={category.name} category={category} rootname="/todos/" isShown = "yes" onDeleteButtonClick = {handleCategoryDelete} ></CategoryItem>)}
        </div>
        <div className="todo-section color2-back">
          <div className="todo-form color8-back">
              <h4 className='color7'>
                New TODO
              </h4>
              <input value={title} placeholder="New todo" onChange={e=>setTitle(e.target.value)} className='color7'></input>
              <textarea 
                  value={description} 
                  placeholder="TODO description" 
                  onChange={e => setDescription(e.target.value)}
                  className="todo-description color7"
              ></textarea>
              <DatePicker selected={selectedDate} onChange={handleDateChange} placeholderText="Set the deadline here"/>
              <select value = {newTODOCategory} onChange={e=>setNewTODOCategory(e.target.value)} className='color7'>
                <option value="" className='color7'>Select a category</option>
                {categories.filter(category => category.userid === userInfo.userId).map((category) => (
                  <option key={category.id} value={category.name} className='color7'>
                    {category.name}
                  </option>
                ))}
              </select>
              <button onClick={newTodo}>{addTODOButtonName}</button>
            </div>
            <h1 className='color7'>
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