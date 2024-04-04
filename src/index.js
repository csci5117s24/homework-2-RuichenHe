import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Todo_Page } from './routes/Todo_page'
import { TODO_detail } from './routes/Todo_detail'
import { Done_Page } from './routes/Done_page'
import { Todo_Filtered_Page } from './routes/Todo_filter'
import { Done_Filtered_Page } from './routes/Done_filter'
import UserInfoProvider from './UserInfoProvider'
import NotFound from './routes/Not_found'
// create the router -- paths are configured here

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children: [
      Todo_Page,
      TODO_detail,
      Done_Page,
      Todo_Filtered_Page,
      Done_Filtered_Page,
    ],
    errorElement: <NotFound/>
  },
  
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserInfoProvider>
      <RouterProvider router={router} />
    </UserInfoProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
