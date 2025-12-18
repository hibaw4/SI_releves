import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Compteurs from './pages/Compteurs';
import CompteurDetails from './pages/CompteurDetails';
import Agents from './pages/Agents';
import AgentDetails from './pages/AgentDetails';
import Releves from './pages/Releves';
import ReleveDetails from './pages/ReleveDetails';
import Users from './pages/Users';
import UserDetails from './pages/UserDetails';
import Reports from './pages/Reports';
import Simulation from './pages/Simulation';
import ChangePassword from './pages/ChangePassword';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="compteurs" element={<Compteurs />} />
            <Route path="compteurs/:id" element={<CompteurDetails />} />
            <Route path="agents" element={<Agents />} />
            <Route path="agents/:id" element={<AgentDetails />} />
            <Route path="releves" element={<Releves />} />
            <Route path="releves/:id" element={<ReleveDetails />} />
            <Route path="reports" element={<Reports />} />
            <Route path="simulation" element={<Simulation />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route
              path="users"
              element={
                <PrivateRoute requireSuperAdmin>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route
              path="users/:id"
              element={
                <PrivateRoute requireSuperAdmin>
                  <UserDetails />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
