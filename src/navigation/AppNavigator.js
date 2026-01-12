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
import ComplaintsScreen from '../screens/ComplaintsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminPlayersScreen from '../screens/admin/AdminPlayersScreen';
import AdminMatchesScreen from '../screens/admin/AdminMatchesScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminNewsScreen from '../screens/admin/AdminNewsScreen';
import AdminStoresScreen from '../screens/admin/AdminStoresScreen';
import AdminTicketsScreen from '../screens/admin/AdminTicketsScreen';
import AdminComplaintsScreen from '../screens/admin/AdminComplaintsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Icônes pour utilisateur normal
const UserTabIcon = ({ name, focused }) => {
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

// Icônes pour admin
const AdminTabIcon = ({ name, focused }) => {
  const icons = {
    AdminHome: '🎛️',
    AdminPlayers: '⚽',
    AdminMatches: '🏟️',
    AdminTickets: '🎟️',
    AdminProducts: '🛍️',
    AdminNews: '📰',
    AdminStores: '🏪',
    AdminComplaints: '💬',
  };

  const labels = {
    AdminHome: 'Dashboard',
    AdminPlayers: 'Joueurs',
    AdminMatches: 'Matchs',
    AdminTickets: 'Tickets',
    AdminProducts: 'Produits',
    AdminNews: 'Actualités',
    AdminStores: 'Magasins',
    AdminComplaints: 'Support',
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 22 }}>{icons[name]}</Text>
      <Text style={{
        fontSize: 9,
        color: focused ? COLORS.primary : COLORS.textSecondary,
        fontWeight: focused ? 'bold' : 'normal'
      }}>
        {labels[name]}
      </Text>
    </View>
  );
};

// Tab Navigator pour UTILISATEUR
const UserTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <UserTabIcon name={route.name} focused={focused} />,
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

// Tab Navigator pour ADMIN
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <AdminTabIcon name={route.name} focused={focused} />,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopColor: COLORS.primary,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.textWhite,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        headerShown: false,
      })}
    >
      <Tab.Screen name="AdminHome" component={AdminDashboardScreen} />
      <Tab.Screen name="AdminPlayers" component={AdminPlayersScreen} />
      <Tab.Screen name="AdminMatches" component={AdminMatchesScreen} />
      <Tab.Screen name="AdminTickets" component={AdminTicketsScreen} />
      <Tab.Screen name="AdminProducts" component={AdminProductsScreen} />
      <Tab.Screen name="AdminNews" component={AdminNewsScreen} />
      <Tab.Screen name="AdminStores" component={AdminStoresScreen} />
      <Tab.Screen name="AdminComplaints" component={AdminComplaintsScreen} />
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
    <Stack.Screen name="Tickets" component={TicketsScreen} />
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

// Stack pour Profile (utilisateur normal)
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
    <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Complaints" component={ComplaintsScreen} />
  </Stack.Navigator>
);

// Auth Stack (non connecté)
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// User Main Stack
const UserMainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={UserTabNavigator} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Admin Main Stack
const AdminMainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
  </Stack.Navigator>
);

// Navigator principal - choisit entre User et Admin
const AppNavigator = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <Text style={{ color: COLORS.textWhite, fontSize: 24, fontWeight: 'bold' }}>🔴⚪</Text>
        <Text style={{ color: COLORS.textWhite, fontSize: 18, marginTop: 10 }}>WYDAD AC</Text>
      </View>
    );
  }

  // Si admin connecté -> interface admin uniquement
  // Sinon -> interface utilisateur normale (avec ou sans connexion)
  return (
    <NavigationContainer>
      {user?.isAdmin ? <AdminMainStack /> : <UserMainStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
