// ===========================================
// WYDAD AC - APP NAVIGATOR
// ===========================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PlayersScreen from '../screens/PlayersScreen';
import PlayerDetailScreen from '../screens/PlayerDetailScreen';
import MatchesScreen from '../screens/MatchesScreen';
import TicketsScreen from '../screens/TicketsScreen';
import MyTicketsScreen from '../screens/MyTicketsScreen';
import ShopScreen from '../screens/ShopScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import StoresScreen from '../screens/StoresScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Icônes simples (texte emoji pour le moment)
const TabIcon = ({ name, focused }) => {
  const icons = {
    Home: '🏠',
    Matches: '⚽',
    Shop: '🛒',
    Stores: '📍',
    Profile: '👤',
  };
  
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>{icons[name]}</Text>
      <Text style={{ 
        fontSize: 10, 
        color: focused ? COLORS.primary : COLORS.textSecondary,
        fontWeight: focused ? 'bold' : 'normal'
      }}>
        {name === 'Home' ? 'Accueil' : 
         name === 'Matches' ? 'Matchs' :
         name === 'Shop' ? 'Boutique' :
         name === 'Stores' ? 'Magasins' : 'Profil'}
      </Text>
    </View>
  );
};

// Tab Navigator (utilisateur connecté)
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Matches" component={MatchesStack} />
      <Tab.Screen name="Shop" component={ShopStack} />
      <Tab.Screen name="Stores" component={StoresStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

// Stack pour Home
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
    <Stack.Screen name="Players" component={PlayersScreen} />
    <Stack.Screen name="PlayerDetail" component={PlayerDetailScreen} />
  </Stack.Navigator>
);

// Stack pour Matches
const MatchesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MatchesMain" component={MatchesScreen} />
    <Stack.Screen name="Tickets" component={TicketsScreen} />
  </Stack.Navigator>
);

// Stack pour Shop
const ShopStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ShopMain" component={ShopScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
  </Stack.Navigator>
);

// Stack pour Stores
const StoresStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StoresMain" component={StoresScreen} />
  </Stack.Navigator>
);

// Stack pour Profile
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
    <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
  </Stack.Navigator>
);

// Auth Stack (non connecté)
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Main Stack (pour inclure l'auth dans la nav principale)
const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={TabNavigator} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Navigator principal
const AppNavigator = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <Text style={{ color: COLORS.textWhite, fontSize: 24, fontWeight: 'bold' }}>🔴⚪</Text>
        <Text style={{ color: COLORS.textWhite, fontSize: 18, marginTop: 10 }}>WYDAD AC</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
};

export default AppNavigator;
