import './App.css';
import { Link, Outlet } from 'react-router-dom';


function App() {

  return (
    <div className="App">
      <Link to="/todos">home!</Link>
      <Outlet />
    </div>
  );
}

export default App;