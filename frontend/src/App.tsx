import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { I18nProvider } from './i18n/i18n';
import ProtecaoInspecao from './components/ProtecaoInspecao';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Formulas from './pages/Formulas';
import Cinetica from './pages/Cinetica';
import Maxwell from './pages/Maxwell';
import Dsc from './pages/Dsc';
import Exercicios from './pages/Exercicios';
import Loja from './pages/Loja';
import Ranking from './pages/Ranking';
import Perfil from './pages/Perfil';

// Separei as rotas nesse componente pra conseguir usar o hook useLocation() e animar a troca de tela
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/formulas" element={<Formulas />} />
        <Route path="/cinetica" element={<Cinetica />} />
        <Route path="/maxwell" element={<Maxwell />} />
        <Route path="/dsc" element={<Dsc />} />
        <Route path="/exercicios" element={<Exercicios />} />
        <Route path="/loja" element={<Loja />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </div>
  );
}

// Componente raiz do React: envolvi tudo com o I18nProvider (ingles por padrao)
// e coloquei o ProtecaoInspecao pra bloquear o clique direito ("Inspecionar") e os atalhos do DevTools!
function App() {
  return (
    <I18nProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand selection:text-dark">
          <ProtecaoInspecao />
          <AnimatedRoutes />
        </div>
      </Router>
    </I18nProvider>
  );
}

export default App;
