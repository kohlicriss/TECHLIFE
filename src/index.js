import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from './App';
import axios from 'axios';


axios.interceptors.request.use(request=>{
  console.log(request);
  return request
})


axios.interceptors.response.use((response)=>{
  console.log(response)
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App/>
);

 
reportWebVitals();
