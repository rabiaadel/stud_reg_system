// ============================================================================
// useAuth Hook — Access authentication context
// Usage: const { user, token, login, logout, isStudent } = useAuth()
// ============================================================================

import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export default useAuth;
