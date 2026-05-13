import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import BuyerNavigator from '../navigation/BuyerNavigator';
import FarmerNavigator from '../navigation/FarmerNavigator';
import AgentNavigator from '../navigation/AgentNavigator';
import AdminNavigator from '../navigation/AdminNavigator';

const RoleGuard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null; // should not happen if used inside AuthProvider

  switch (user.role) {
    case 'buyer':
      return <BuyerNavigator />;
    case 'farmer':
      return <FarmerNavigator />;
    case 'agent':
      return <AgentNavigator />;
    case 'admin':
      return <AdminNavigator />;
    default:
      return null;
  }
};

export default RoleGuard;