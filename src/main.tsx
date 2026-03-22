import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import ButikkpriserApp from './MatprisApp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ButikkpriserApp />
  </StrictMode>,
);
