import { useLoaderData } from 'react-router-dom';
import { useState } from 'react';
import '../common/style.css';
import UserInfoContext from '../UserInfoContext';
import { useLoaderData } from 'react-router-dom';
async function loader({ request, params }) {
  const { id } = params;

  const todoRequest = fetch("/api/todo/"+id, {
    signal: request.signal,
    method: "GET",
  });
  const categoryRequest = fetch("/api/categories", {
    signal: request.signal,
    method: "GET",
  });

  const [result1, result2] = await Promise.all([todoRequest, categoryRequest]);
  if (result1.ok && result2.ok) {
    const [todoDetail,categorydata] = await Promise.all([result1.json(), result2.json()]);
    return {todoDetail, categorydata}
   } else {
    // this is just going to trigger the 404 page, but we can fix that later :|
    throw new Response("ERROR");
  }
}

function TodoDetail() {
  const {todoDetail, categorydata}  = useLoaderData();
  const [newTitle, setNewTitle] = useState(todoDetail.todo.title);
  const [newDescription, setNewDescription] = useState(todoDetail.todo.description);
  const [newStatus, setNewStatus] = useState(todoDetail.todo.status);
  const [newCategory, setNewCategory] = useState(todoDetail.todo.category[0] || "");
  const [updateButtonName, setUpdateButtonName] = useState("Update")
  const [notification, setNotification] = useState({ message: '', visible: false, nf_type: "notification-success"});
  const userInfo = useContext(UserInfoContext);
  async function updateTODOItem() {
    setUpdateButtonName("Waiting");
    if (newTitle.trim() === "") {
      setNotification({ message: 'Title is required.', visible: true, nf_type: "notification"});
      setTimeout(() => {
          setNotification({ message: '', visible: false });
      }, 3000); // Hides the notification after 3 seconds
      setUpdateButtonName("Update");
      setNewTitle(todoDetail.todo.title);
      return; // Exit the function
    } else if (newDescription.trim() === ""){
      setNotification({ message: 'Description is required.', visible: true, nf_type: "notification"});
      setTimeout(() => {
          setNotification({ message: '', visible: false });
      }, 3000); // Hides the notification after 3 seconds
      setUpdateButtonName("Update");
      setNewDescription(todoDetail.todo.description)
      return; // Exit the function
    }
    const newTODOItem = {
      title: newTitle, 
      description: newDescription, 
      isDone: newStatus, 
      userID: userInfo.userId,
      category: newCategory.trim() === "" ? [] : [newCategory]
    }
    setNewTitle(newTitle)
    setNewDescription(newDescription)
    await fetch("/api/todo/"+todoDetail.todo._id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newTODOItem)
    })
    setNotification({ message: 'Successfully updated TODO Item :)', visible: true, nf_type: "notification-success"});
      setTimeout(() => {
          setNotification({ message: '', visible: false, nf_type: "notification-success"});
      }, 3000);
    setUpdateButtonName("Update");
    
  }
  async function updateStatus() {
    if (newStatus === "done"){
      setNewStatus("todo");
    } else {
      setNewStatus("done");
    }
  }
  return (
    
    <div>
      <div className="todo-form">
      <div className="input-group">
        <label htmlFor="titleInput" className="form-label">Title:</label>
        <input 
          id="titleInput"
          value={newTitle} 
          placeholder="Enter title" 
          onChange={e => setNewTitle(e.target.value)}
        />
      </div>

      <div className="textarea-group">
        <label htmlFor="descriptionTextarea" className="form-label">Description:</label>
        <textarea 
          id="descriptionTextarea"
          value={newDescription}
          placeholder="Enter description" 
          onChange={e => setNewDescription(e.target.value)}
          className="todo-description"
        ></textarea>
      </div>
      <div className="category-group">
      <label htmlFor="categoryTextarea" className="form-label">Category:</label>
        <select value = {newCategory} onChange={e=>setNewCategory(e.target.value)} >
            <option value="">Select a category</option>
            {categorydata.data.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
        </select>
      </div>
      
      <div className="status-container">
          <span className={`status-indicator ${newStatus}`}>Status: {newStatus}</span>
          <button onClick={updateStatus} className={`status-btn ${newStatus}`} aria-label={newStatus === "done" ? "Mark as Todo" : "Mark as Done"}>
              {newStatus === "done" ? <i className="fas fa-undo"></i> : <i className="fas fa-check"></i>}
              {newStatus === "done" ? "Undo" : "Finish"}
          </button>
      </div>
        <button onClick={updateTODOItem}>{updateButtonName}</button>
        {notification.visible && <div className={notification.nf_type}>{notification.message}</div>}
      </div>
    </div>

  );
}

export const TODO_detail = {
  path:"/todo/:id",
  element:<TodoDetail></TodoDetail>,
  loader:loader
}