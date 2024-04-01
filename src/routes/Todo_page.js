import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import TodoItem from '../common/TodoItem';
import { Link, Outlet } from 'react-router-dom';
import CategoryItem from '../common/CategoryItem';
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
      setTODOs([...todos, await result.json()]);
      setTitle("");
    }
  }

  const [categories, setCategories] = useState(categorydata.data);
  const [name, setName] = useState("");

  async function newCategory() {
    const result = await fetch("/api/category", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({name})
    })
    if (result.ok) {
      setCategories([...categories, await result.json()]);
      setName("");
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
        <div>
            <input value={name} placeholder="New category" onChange={e=>setName(e.target.value)}></input>
            <button onClick={newCategory}>Add Category</button>
            {categories.map(category => <CategoryItem key={category.name} category={category}></CategoryItem>)}
            
        </div>
    </div>
    
  );
}

export const Todo_Page = {
  path:"/todos",
  element:<App></App>,
  loader:loader
}