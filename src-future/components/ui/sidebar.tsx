import React from 'react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/grupos">Grupos</a>
          </li>
          <li>
            <a href="/sobre">Sobre</a>
          </li>
          <li>
            <a href="/contato">Contato</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;