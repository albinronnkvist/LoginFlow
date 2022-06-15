import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Render a React element into the DOM.
ReactDOM.render(
  // StrictMode is a tool for highlighting potential problems in an application.
  // Strict mode checks are run in development mode only; they do not impact the production build.
  <React.StrictMode>
    {/* Render the App component */}
    <App />
  </React.StrictMode>,
  document.getElementById('root') // Render the app in the 'root' div.
);