import { useLoaderData } from 'react-router-dom';
import { useState } from 'react';
async function loader({ request, params }) {
  const { id } = params;
  const result = await fetch("/api/todo/"+id, {
    signal: request.signal,
    method: "get",
  });
  if (result.ok) {
    return await result.json()
  } else {
    // this is just going to trigger the 404 page, but we can fix that later :|
    throw new Response("ERROR", { status: result.status });
  }
}

function TodoDetail() {
  const  todoDetail  = useLoaderData();
  const [newTitle, setNewTitle] = useState(todoDetail.todo.title);
  const [newDescription, setNewDescription] = useState(todoDetail.todo.description);
  const [newStatus, setNewStatus] = useState(todoDetail.todo.status);
  async function updateTODOItem() {
    const newTODOItem = {title: newTitle, description: newDescription, isDone: newStatus, category: todoDetail.todo.category}
    setNewTitle(newTitle)
    setNewDescription(newDescription)
    fetch("/api/todo/"+todoDetail.todo._id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newTODOItem)
    })
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
        <div>
            Title:
            <input value={newTitle} placeholder={todoDetail.todo.title} onChange={e=>setNewTitle(e.target.value)}></input>
        </div>
        <div>
            Description:
            <input value={newDescription} placeholder={todoDetail.todo.description} onChange={e=>setNewDescription(e.target.value)}></input>
        </div>
        <div>
            Status: 
            {newStatus}
            <button onClick={updateStatus}> {newStatus === "done" ? "Undo" : "Finish"} </button>
        </div>
        <button onClick={updateTODOItem}>Update</button>
    </div>

  );
}

export const TODO_detail = {
  path:"/todo/:id",
  element:<TodoDetail></TodoDetail>,
  loader:loader
}