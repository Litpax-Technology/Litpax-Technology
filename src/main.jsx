import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/photos.css';
import './styles/premium.css';
import './styles/inside-pack.css';

createRoot(document.getElementById('root')).render(<App />);
