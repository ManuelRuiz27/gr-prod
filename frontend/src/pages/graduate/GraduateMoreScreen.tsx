import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../design-system';

const links = [['Mi contrato', '/graduate/contract'], ['Mi termo', '/graduate/thermo'], ['Platillos', '/graduate/meals'], ['Mesa', '/graduate/table']] as const;

export const GraduateMoreScreen: React.FC = () => (
  <div className="w-full max-w-3xl mx-auto flex flex-col gap-7 font-sans animate-fadeIn pb-12">
    <header><h1 className="text-2xl font-display font-bold text-silver-50">Más</h1></header>
    <nav aria-label="Más opciones" className="space-y-1">
      {links.map(([label, to]) => <Link key={to} to={to} className="flex items-center justify-between rounded-lg px-2 py-3.5 -mx-2 hover:bg-obsidian-900/40 transition-colors"><span className="text-sm font-medium text-silver-100">{label}</span><Icon name="chevron-right" size={16} className="text-silver-500" /></Link>)}
    </nav>
    <div className="space-y-3 pt-4"><p className="text-sm text-silver-300">Contacto GR</p><Link to="/login" className="block pt-3 text-sm text-silver-400 hover:text-silver-100">Cerrar sesión</Link></div>
  </div>
);
