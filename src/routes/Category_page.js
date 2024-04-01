import logo from '../logo.svg';
import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import CategoryItem from '../common/CategoryItem';

async function loader({ request }) {
    const result = await fetch("/api/categories", {
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
  const [categories, setDecks] = useState(data);
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
      setDecks([...categories, await result.json()]);
      setName("");
    }
  }

  return (
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
            {categories.map(category => <CategoryItem key={category.name} category={category}></CategoryItem>)}
            <input value={name} placeholder="New category" onChange={e=>setName(e.target.value)}></input>
            <button onClick={newCategory}>Add Category</button>
        </div>
      </header>
  );
}

export const Category_Page = {
  path:"/",
  element:<App></App>,
  loader:loader
}