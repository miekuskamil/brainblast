// Entry point: mount the app. Vite's React plugin supplies the JSX runtime.
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './styles/app.css';

createRoot(document.getElementById('root')).render(<App />);
