import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import ShipmentControlScreen from '../screens/admin/ShipmentControlScreen';
import DepositFundsScreen from '../screens/admin/DepositFundsScreen';
import AuditLogsScreen from '../screens/admin/AuditLogsScreen';
import LogoutHeaderButton from '../components/LogoutHeaderButton';

const Tab = createBottomTabNavigator();

const AdminNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerRight: () => <LogoutHeaderButton />,
    }}
  >
    <Tab.Screen name="Users" component={ManageUsersScreen} />
    <Tab.Screen name="Shipments" component={ShipmentControlScreen} />
    <Tab.Screen name="Deposit" component={DepositFundsScreen} />
    <Tab.Screen name="Audit" component={AuditLogsScreen} />
  </Tab.Navigator>
);

export default AdminNavigator;