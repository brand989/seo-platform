import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProjectsList from './pages/ProjectsList';
import ProjectNew from './pages/ProjectNew';
import Competitors from './pages/Competitors';
import Result from './pages/Result';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/new" element={<ProjectNew />} />
        <Route path="/projects/:id" element={<Navigate to="result" replace />} />
        <Route path="/projects/:id/competitors" element={<Competitors />} />
        <Route path="/projects/:id/result" element={<Result />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </Layout>
  );
}
