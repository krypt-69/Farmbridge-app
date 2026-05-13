import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const LogoutHeaderButton: React.FC = () => {
  const { logout } = useAuth();
  return (
    <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
      <Text style={{ color: '#2E8B57', fontSize: 16 }}>Logout</Text>
    </TouchableOpacity>
  );
};

export default LogoutHeaderButton;