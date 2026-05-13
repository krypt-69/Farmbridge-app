import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PlaceOrderScreen from '../screens/buyer/PlaceOrderScreen';
import MyOrdersScreen from '../screens/buyer/MyOrdersScreen';
import WalletScreen from '../screens/buyer/WalletScreen';
import BuyerShipmentsScreen from '../screens/buyer/BuyerShipmentsScreen';
import LogoutHeaderButton from '../components/LogoutHeaderButton';

const Tab = createBottomTabNavigator();

const BuyerNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerRight: () => <LogoutHeaderButton />,
    }}
  >
    <Tab.Screen name="PlaceOrder" component={PlaceOrderScreen} />
    <Tab.Screen name="MyOrders" component={MyOrdersScreen} />
    <Tab.Screen name="Wallet" component={WalletScreen} />
    <Tab.Screen name="Shipments" component={BuyerShipmentsScreen} />
  </Tab.Navigator>
);

export default BuyerNavigator;