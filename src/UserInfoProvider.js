import React, { useState, useEffect } from 'react';
import UserInfoContext from './UserInfoContext';

function UserInfoProvider({ children }) {
  const [userInfo, setUserInfo] = useState();

  useEffect(() => {
    (async () => {
      const response = await fetch('/.auth/me');
      const payload = await response.json();
      const { clientPrincipal } = payload;
      setUserInfo(clientPrincipal);
    })();
  }, []);

  return (
    <UserInfoContext.Provider value={userInfo}>
      {children}
    </UserInfoContext.Provider>
  );
}

export default UserInfoProvider;