import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Venda Next App</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:underline">Home</Link>
            </li>
            <li>
              <Link to="/grupos" className="hover:underline">Grupos</Link>
            </li>
            <li>
              <Link to="/sobre" className="hover:underline">Sobre</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;