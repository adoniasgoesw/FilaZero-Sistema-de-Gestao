import React, { useState } from 'react';
import FormLogin from '../forms/FormLogin.jsx';
import FormRegister from '../forms/FormRegister.jsx';

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('login'); // 'login' ou 'register'

  // Abre modal com tipo login
  const openLogin = () => {
    setModalType('login');
    setModalOpen(true);
  };

  // Abre modal com tipo registro
  const openRegister = () => {
    setModalType('register');
    setModalOpen(true);
  };

  // Fecha modal
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <header className="bg-[#FF6B6B] px-8 py-4 flex items-center">
        <span className="text-white text-2xl font-bold mr-6">FilaZero</span>
        <button
          onClick={openLogin}
          className="bg-white text-[#FF6B6B] px-4 py-2 rounded-md font-semibold hover:bg-[#fde0e0] transition"
        >
          Acessar Sistema
        </button>
      </header>

      {modalOpen && modalType === 'login' && (
        <FormLogin
          isOpen={modalOpen}
          onClose={closeModal}
          onSwitchToRegister={openRegister} // Passa para o FormLogin
        />
      )}

      {modalOpen && modalType === 'register' && (
        <FormRegister
          isOpen={modalOpen}
          onClose={closeModal}
          onSwitchToLogin={openLogin} // Passa para o FormRegister
        />
      )}
    </>
  );
};

export default Header;