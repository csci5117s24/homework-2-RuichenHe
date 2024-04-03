import './App.css';
import './common/style.css'
import { Link, Outlet } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

function App() {
  const [userInfo, setUserInfo] = useState();

  useEffect(() => {
    (async () => {
      setUserInfo(await getUserInfo());
    })();
  }, []);

  async function getUserInfo() {
    try {
      const response = await fetch('/.auth/me');
      const payload = await response.json();
      const { clientPrincipal } = payload;
      return clientPrincipal;
    } catch (error) {
      console.error('No profile could be found');
      return undefined;
    }
  }

  return (
    <div className="App">
      <div className="top-bar">
        <div className='home-head'>
        {userInfo && <Link to="/todos">{userInfo.userDetails}'s TODO List</Link>}
        </div>
        <div className='bottom-buttons'>
          <div className='bottom-button-container'>
          {userInfo && <Link to="/todos" className='bottom-link-todo'>TODO List</Link>}
          </div>
          <div className='bottom-button-container'>
          {userInfo && <Link to="/done" className='bottom-link-done'>DONE List</Link>}
          </div>
          <div className='bottom-button-container'>
          {userInfo && <a href='/.auth/logout' className='bottom-link-done'>Log out</a>}
          </div>
        </div>
      </div>
      {!userInfo && <a href="/.auth/login/github?post_login_redirect_uri=/todos">Login</a>}
      
      <Outlet />
    </div>
  );
}

export default App;