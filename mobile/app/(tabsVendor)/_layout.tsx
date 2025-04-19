import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          elevation: 10,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        },
        tabBarActiveTintColor: '#FF5200',
        tabBarInactiveTintColor: '#888888',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarItemStyle: {
          paddingTop: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'dashboard') {
            return <MaterialIcons name="home" size={size} color={color} />;
          } else if (route.name === 'leaderboard') {
            return <MaterialIcons name="leaderboard" size={size} color={color} />;
          } else if (route.name === 'statistics') {
            return <MaterialIcons name="bar-chart" size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarShowLabel: true,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarLabel: "Leaderboard",
          tabBarShowLabel: true,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Statistics",
          tabBarLabel: "Statistics",
          tabBarShowLabel: true,
        }}
      />
    </Tabs>
  );
}
