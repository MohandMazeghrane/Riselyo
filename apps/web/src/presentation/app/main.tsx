import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { createContainer } from './container';
import { ContainerProvider } from './ContainerContext';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Riselyo: #root element is missing from index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <ContainerProvider container={createContainer()}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ContainerProvider>
  </StrictMode>,
);
