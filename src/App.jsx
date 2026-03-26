import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Pacientes from "./pages/Pacientes";
import Agenda from "./pages/Agenda";
import RedefinirSenha from "./pages/RedefinirSenha";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/pacientes"
          element={
            <PrivateRoute>
              <Pacientes />
            </PrivateRoute>
          }
        />

        <Route
          path="/agenda"
          element={
            <PrivateRoute>
              <Agenda />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
