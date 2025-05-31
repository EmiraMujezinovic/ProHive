import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component for guarding routes based on authentication and role.
 * @param {ReactNode} children - The component to render if access is granted.
 * @param {string|string[]} requiredRole - The required user role(s) for this route.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  // Get token and role from localStorage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // If not logged in, redirect to login
  if (!token) return <Navigate to="/login" replace />;

  // If role is required, check it
  if (requiredRole) {
    // Support both string and array for requiredRole
    const allowed = Array.isArray(requiredRole)
      ? requiredRole.includes(role)
      : role === requiredRole;
    if (!allowed) return <Navigate to="/login" replace />;
  }

  // Otherwise, render the children
  return children;
};

export default ProtectedRoute;
