import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AssignedShipmentsScreen from '../screens/agent/AssignedShipmentsScreen';
import VerificationSubmissionScreen from '../screens/agent/VerificationSubmissionScreen';
import VerificationHistoryScreen from '../screens/agent/VerificationHistoryScreen';
import LogoutHeaderButton from '../components/LogoutHeaderButton';

const Tab = createBottomTabNavigator();

const AgentNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerRight: () => <LogoutHeaderButton />,
    }}
  >
    <Tab.Screen name="Assigned" component={AssignedShipmentsScreen} />
    <Tab.Screen name="Verify" component={VerificationSubmissionScreen} />
    <Tab.Screen name="History" component={VerificationHistoryScreen} />
  </Tab.Navigator>
);

export default AgentNavigator;