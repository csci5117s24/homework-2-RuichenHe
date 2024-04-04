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
      //console.log(clientPrincipal)
      return clientPrincipal;
    } catch (error) {
      console.error('No profile could be found');
      return undefined;
    }
  }

  return (
    <div className="App color4-back">
      <div className="top-bar color6-back">
        <div className='home-head color1-back'>
        {userInfo && <Link to="/todos" className='color4 nodecoration'>{userInfo.userDetails}'s TODO List</Link>}
        {!userInfo && <text className='color4 nodecoration'>TODO List</text>}
        </div>
        <div className='bottom-buttons'>
          <div className='bottom-button-container'>
          {userInfo && <Link to="/todos" className='bottom-link-todo'>TODO List</Link>}
          {!userInfo && <a href="/.auth/login/github?post_login_redirect_uri=/todos" className='bottom-link-todo'>Login</a>}
          </div>
          <div className='bottom-button-container'>
          {userInfo && <Link to="/done" className='bottom-link-done'>DONE List</Link>}
          </div>
          <div className='bottom-button-container'>
          {userInfo && <a href='/.auth/logout' className='bottom-link-done'>Log out</a>}
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

export default App;