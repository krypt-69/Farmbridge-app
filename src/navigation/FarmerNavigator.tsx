import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FarmerProfileScreen from '../screens/farmer/FarmerProfileScreen';
import FarmerHarvestScreen from '../screens/farmer/FarmerHarvestScreen';
import FarmerVerificationsScreen from '../screens/farmer/FarmerVerificationsScreen';
import FarmerWalletScreen from '../screens/farmer/FarmerWalletScreen';  // now the dedicated screen
import LogoutHeaderButton from '../components/LogoutHeaderButton';

const Tab = createBottomTabNavigator();

const FarmerNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerRight: () => <LogoutHeaderButton />,
      headerStyle: { backgroundColor: '#2E8B57' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Tab.Screen name="Profile" component={FarmerProfileScreen} />
    <Tab.Screen name="Harvest" component={FarmerHarvestScreen} />
    <Tab.Screen name="Verifications" component={FarmerVerificationsScreen} />
    <Tab.Screen name="Wallet" component={FarmerWalletScreen} />
  </Tab.Navigator>
);

export default FarmerNavigator;