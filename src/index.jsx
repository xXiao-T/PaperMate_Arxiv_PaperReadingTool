import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // 引入全局样式（包括 Tailwind）
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);