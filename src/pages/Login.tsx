
import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { user, loading } = useAuth();
  
  // If already authenticated, redirect to dashboard
  if (user && !loading) {
    return <Navigate to="/" />;
  }
  
  return <LoginForm />;
}
