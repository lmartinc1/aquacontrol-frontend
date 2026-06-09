import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar abierto={sidebarAbierto} setAbierto={setSidebarAbierto} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar móvil */}
        <header className="lg:hidden flex items-center gap-3 bg-agua-800 text-white px-4 py-3 shadow-md">
          <button
            onClick={() => setSidebarAbierto(true)}
            className="text-agua-200 hover:text-white text-xl"
          >☰</button>
          <span className="font-bold text-base">AquaControl</span>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
