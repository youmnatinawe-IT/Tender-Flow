// import { Navigate } from 'react-router-dom';
// import { useAuth } from './AuthContext';

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const { isAuthenticated, userRole } = useAuth();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(userRole)) {
//     return <Navigate to="/login" replace />; 
//   }

//   return children;
// };

// export default ProtectedRoute;