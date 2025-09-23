import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';

type ProtectedRouteProp = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProp) => {
  const { isLoggedIn } = useAuthContext();
  console.log('Protected Route check', isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
