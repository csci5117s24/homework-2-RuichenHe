import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import TodoItem from '../common/TodoItem';
import { Link, Outlet } from 'react-router-dom';
async function loader({ request }) {
    const result = await fetch("/api/todos", {
        signal: request.signal,
        method: "GET",
    });
    if (result.ok) {
    return await result.json()
    } else {
    // this is just going to trigger the 404 page, but we can fix that later :|
    throw new Response("ERROR", { status: result.status });
    }
}

function App() {
  // eslint-disable-next-line
  const { data } = useLoaderData();
  const [todos, setDecks] = useState(data);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const status = "todo";

  async function newTodo() {
    
    const newTodo = {title: title, description: description, status: status}
    const result = await fetch("/api/todo", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodo)
    })
    if (result.ok) {
      setDecks([...todos, await result.json()]);
      setTitle("");
    }
  }

  return (
    <div>
        <input value={title} placeholder="New todo" onChange={e=>setTitle(e.target.value)}></input>
        <input value={description} placeholder="TODO description" onChange={e=>setDescription(e.target.value)}></input>
        <button onClick={newTodo}>Add TODO</button>
        {todos.filter(todo => todo.status === "todo").map(todo => <TodoItem key={todo.title} todo={todo}></TodoItem>)}
        <div>
          <Link to="/done">DONE List</Link>
          <Outlet />
        </div>
    </div>
  );
}

export const Todo_Page = {
  path:"/todos",
  element:<App></App>,
  loader:loader
}