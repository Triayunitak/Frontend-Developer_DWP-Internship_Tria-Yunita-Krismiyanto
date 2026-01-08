import { useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('rememberedUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData, remember) => {
    setUser(userData);
    if (remember) {
      localStorage.setItem('rememberedUser', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rememberedUser');
  };

  return { user, login, logout };
};