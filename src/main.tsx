<<<<<<< HEAD
﻿import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'  // your Tailwind CSS file
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
=======
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
>>>>>>> 9afc44d0c8ffebbb5b60b3b379e54663283bde89
