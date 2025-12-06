import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigationRef = useRef(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
    setLoading(false);
  };

  const resetNavigation = (routeName) => {
    if (navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: routeName }],
      });
    }
  };

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={isLoggedIn ? 'Dashboard' : 'Login'}
      >
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onLoginSuccess={() => {
            setIsLoggedIn(true);
            resetNavigation('Dashboard');
          }} />}
        </Stack.Screen>
        <Stack.Screen name="Signup">
          {(props) => <SignupScreen {...props} onSignupSuccess={() => {
            setIsLoggedIn(true);
            resetNavigation('Dashboard');
          }} />}
        </Stack.Screen>
        <Stack.Screen name="Dashboard">
          {(props) => <DashboardScreen {...props} onLogout={() => {
            setIsLoggedIn(false);
            resetNavigation('Login');
          }} />}
        </Stack.Screen>
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

