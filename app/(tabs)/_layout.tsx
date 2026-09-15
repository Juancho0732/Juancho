import { Tabs } from 'expo-router';

import { theme } from '@/design-system/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Barra en vino con el activo en amarillo: el mismo par del wordmark.
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onPrimaryMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: theme.borderWidth.thick,
          borderTopColor: theme.colors.frame,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.family.medium,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="search" options={{ title: 'Buscar' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favoritos' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
