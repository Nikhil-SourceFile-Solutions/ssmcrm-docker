import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ element, allowed }) => {
  const {authUser } = useAuth()

  if (!allowed.includes(authUser.user_type)) {
    return <Navigate to="/not-authorized" />; // Redirect if user is not allowed
  }

  return element; // Render the element if allowed
};

export default ProtectedRoute;
