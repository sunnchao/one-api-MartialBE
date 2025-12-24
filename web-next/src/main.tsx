import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './app/globals.css';
import '@/i18n';
import config from '@/config';
import Providers from './app/providers';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={config.basename}>
    <Providers>
      <App />
    </Providers>
  </BrowserRouter>
);
