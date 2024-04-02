import './App.css';
import './common/style.css'
import { Link, Outlet } from 'react-router-dom';


function App() {

  return (
    <div className="App">
      <div className="top-bar">
        <div className='home-head'>
          <Link to="/todos">Ruichen's TODO List</Link>
        </div>
        <div className='bottom-buttons'>
          <div className='bottom-button-container'>
            <Link to="/todos" className='bottom-link-todo'>TODO List</Link>
          </div>
          <div className='bottom-button-container'>
            <Link to="/done" className='bottom-link-done'>DONE List</Link>
          </div>
        </div>
      </div>
      <a href="/.auth/login/github?post_login_redirect_uri=/todos">Login</a>
      <a href='/.auth/logout'>Log out</a>
      <Outlet />
    </div>
  );
}

export default App;