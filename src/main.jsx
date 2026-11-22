import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/site.css';
import './styles/hero.css';
import './styles/tour.css';
import './styles/trust.css';
import './styles/header.css';
import './styles/premium.css';

createRoot(document.getElementById('root')).render(<App />);
