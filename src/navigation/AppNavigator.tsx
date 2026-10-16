import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import TeamsScreen from '../screens/TeamsScreen';
import TeamDetailScreen from '../screens/TeamDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

// 1. Auth Stack
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

// 2. Main Tab Navigator
function MainTabs() {
  const paperTheme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#EFE7DC',
          elevation: 1,
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#2B1F17',
          fontSize: 18,
        },
        headerTintColor: '#2B1F17',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EFE7DC',
          elevation: 4,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 12,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'help-circle';

          if (route.name === 'Home') {
            iconName = focused ? 'checkbox-marked-circle' : 'checkbox-marked-circle-outline';
          } else if (route.name === 'Teams') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account-circle' : 'account-circle-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35', // Warm Orange
        tabBarInactiveTintColor: '#9E8F82', // Warm Muted Beige Grey
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'TaFo Tasks' }} />
      <Tab.Screen name="Teams" component={TeamsScreen} options={{ title: 'Teams' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// 3. Root Navigator
const AppNavigator = () => {
  const paperTheme = useTheme();
  const { user, loading } = useAuth();

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#FAF5EE', // Warm Cream Beige
      card: '#FFFFFF',
      text: '#2B1F17',
      border: '#E8DDD0',
      primary: '#FF6B35',
    },
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#FAF5EE' }]}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? (
        <MainStack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTitleStyle: {
              fontWeight: '700',
              color: '#2B1F17',
            },
            headerTintColor: '#FF6B35',
            headerShadowVisible: false,
          }}
        >
          <MainStack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <MainStack.Screen
            name="TeamDetail"
            component={TeamDetailScreen}
            options={{ title: 'Team Details' }}
          />
          <MainStack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ title: 'Team Chat' }}
          />
        </MainStack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
