import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { NovoEdital } from './pages/NovoEdital.jsx';
import { DetalheEdital } from './pages/DetalheEdital.jsx';

// Aberto direto do disco (file://) não há servidor para rotas limpas: usa hash.
const Router = typeof window !== 'undefined' && window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

export function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/novo" element={<NovoEdital />} />
          <Route path="/edital/:id" element={<DetalheEdital />} />
        </Route>
      </Routes>
    </Router>
  );
}
