import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import TodoItem from '../common/TodoItem';
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
  const [todos, ] = useState(data);


  return (
    <div>
        {todos.filter(todo => todo.status === "done").map(todo => <TodoItem key={todo.title} todo={todo}></TodoItem>)}
    </div>
  );
}

export const Done_Page = {
  path:"/done",
  element:<App></App>,
  loader:loader
}