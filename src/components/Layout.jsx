import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Calendar,
  Users,
  LogOut,
  User,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, nomeExibicao, cargo, isProfissional } = useAuth();
  const navigate = useNavigate();

  // Bloqueador do scroll da página atrás enquanto o menu (celular/tablet) estiver aberto
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [sidebarOpen]);

  // - Função de deslogar -
  const handleSignOut = async () => {
    const confirmou = window.confirm(
      "Você realmente deseja sair da sua conta?",
    );
    if (confirmou) {
      try {
        await signOut();
        navigate("/");
      } catch (error) {
        console.error("Erro ao deslogar:", error);
      }
    }
  };

  // - Array de Navegação -
  const navItems = [
    { to: "/home", icon: <Home size={22} />, label: "Início" },
    { to: "/agenda", icon: <Calendar size={22} />, label: "Agenda" },
    { to: "/pacientes", icon: <Users size={22} />, label: "Pacientes" },
  ];

  // Função para saber se o link está ativo
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold
    transition-colors text-base
    ${
      isActive
        ? "bg-gradient-to-r from-[#2D6D7F] to-[#51C5E5] text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  // Avatar
  const Avatar = ({ size = "md" }) => {
    const dim = size === "sm" ? "w-8 h-8" : "w-9 h-9";
    const iconSize = size === "sm" ? 16 : 18;

    if (isProfissional) {
      return (
        <div
          className={`${dim} rounded-full bg-[#2D6D7F] flex items-center
        justify-center shrink-0`}
        >
          <Stethoscope size={iconSize} className="text-white" />
        </div>
      );
    }

    return (
      <div
        className={`${dim} rounded-full bg-[#2D6D7F] flex items-center
      justify-center shrink-0`}
      >
        <User size={iconSize} className="text-white" />
      </div>
    );
  };

  // Bloco de perfil
  const PerfilBloco = () => (
    <div className="px-4 py-4 border-t border-gray-200 flex items-center gap-3">
      <Avatar />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-800 truncate">
          {nomeExibicao}
        </p>
        <p className="text-xs text-gray-400">{cargo}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* - Sidebar fixa (PC) - */}
      <aside
        className="hidden lg:flex flex-col w-56 bg-white border-r
        border-gray-200 fixed h-full z-20"
      >
        <div className="px-5 py-5 border-b border-gray-200">
          <p className="font-semibold text-[#2D6D7F] text-base leading-tight">
            Acalanto FisioGest
          </p>
          <p className="text-gray-400 text-sm">Sistema de Gestão</p>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <PerfilBloco />
      </aside>

      {/* - Drawer (celular e tablet) - */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="relative w-72 bg-white h-full flex flex-col
            z-50 shadow-2xl"
          >
            <div
              className="px-5 py-5 border-b border-gray-200 flex
              items-center justify-between"
            >
              <div>
                <p className="font-bold text-[#2D6D7F] text-base">
                  Acalanto FisioGest
                </p>
                <p className="text-gray-400 text-xs">Sistema de Gestão</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-200"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navLinkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <PerfilBloco />
          </aside>
        </div>
      )}

      {/* - Conteúdo principal - */}
      <div className="flex-1 flex flex-col lg:ml-56 min-w-0">
        {/* Topbar */}
        <header
          className="bg-white border-b border-gray-200 px-4 py-3 flex
          items-center justify-between sticky top-0 z-10 lg:px-6"
        >
          <div className="flex items-center gap-3">
            {/* Hamburguer (celular e tablet) */}
            <button
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} className="text-[#2D6D7F]" />
            </button>

            {/* Nome do app (celular e tablet) */}
            <span className="lg:hidden font-bold text-[#2D6D7F] text-base">
              Acalanto FisioGest
            </span>

            {/* Saudação (PC) */}
            <div className="hidden lg:flex items-center gap-3">
              <div>
                <p className="text-sm text-gray-500">Bem-vindo de volta,</p>
                <p className="font-bold text-gray-800">{nomeExibicao}!</p>
              </div>
            </div>
          </div>

          {/*Botão de Logout*/}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-red-500 hover:text-red-700
              font-semibold text-sm transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden lg:inline">Sair</span>
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
