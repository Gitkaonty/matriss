import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';
import { Toaster } from 'react-hot-toast';
import { FileInfosProvider } from './context/SendDataToParent';

//if (process.env.NODE_ENV === 'production') {
disableReactDevTools();
//}

ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FileInfosProvider>
          <App />
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
              },
              duration: 4000,
              success: {
                duration: 5000,
                style: {
                  background: '#799351',
                },
              },
              error: {
                duration: 7000,
                style: {
                  background: '#FF8A8A',
                },
              },
            }}
          />
        </FileInfosProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

