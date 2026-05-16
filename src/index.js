import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ClerkProvider publishableKey="pk_test_bW92ZWQtYmlyZC05Mi5jbGVyay5hY2NvdW50cy5kZXYk">
    <App />
  </ClerkProvider>
);