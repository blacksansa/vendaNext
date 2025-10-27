import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Venda Next App. Todos os direitos reservados.</p>
        <div className="mt-2">
          <a href="/privacy" className="text-gray-400 hover:text-white">Política de Privacidade</a>
          <span className="mx-2">|</span>
          <a href="/terms" className="text-gray-400 hover:text-white">Termos de Serviço</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;