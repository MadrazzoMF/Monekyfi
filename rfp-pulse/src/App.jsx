import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { NovoEdital } from './pages/NovoEdital.jsx';
import { DetalheEdital } from './pages/DetalheEdital.jsx';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/novo" element={<NovoEdital />} />
          <Route path="/edital/:id" element={<DetalheEdital />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
