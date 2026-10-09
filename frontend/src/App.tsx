import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Cinetica from './pages/Cinetica';
import Maxwell from './pages/Maxwell';
import Dsc from './pages/Dsc';
import Exercicios from './pages/Exercicios';
import Loja from './pages/Loja';
import Ranking from './pages/Ranking';
import Perfil from './pages/Perfil';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cinetica" element={<Cinetica />} />
          <Route path="/maxwell" element={<Maxwell />} />
          <Route path="/dsc" element={<Dsc />} />
          <Route path="/exercicios" element={<Exercicios />} />
          <Route path="/loja" element={<Loja />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
