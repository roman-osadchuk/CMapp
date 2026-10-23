import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#7C3AED' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Balances',
          tabBarIcon: ({ color }) => <Ionicons name="wallet" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="claim"
        options={{
          title: 'Claim',
          tabBarIcon: ({ color }) => <Ionicons name="paper-plane" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
