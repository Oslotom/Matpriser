import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import MatprisApp from './MatprisApp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MatprisApp />
  </StrictMode>,
);
