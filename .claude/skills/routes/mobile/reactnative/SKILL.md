# React Native — SKILL

## Overview
JavaScript/TypeScript framework for building native mobile apps using React.
React Native 0.84+ runs entirely on New Architecture (Fabric + TurboModules). Hermes V1 default engine.
Expo SDK 53+ recommended. Requires Node.js 22+.

## Setup / Base Project
```bash
# Expo (recommended for most apps)
npx create-expo-app@latest my-app --template blank-typescript
cd my-app && npx expo start

# Bare React Native (when full native control needed)
npx @react-native-community/cli init MyApp --pm npm
cd MyApp && npx react-native run-android  # or run-ios
```

## Core Concepts
- **Expo** — Managed workflow for 90%+ of apps; `expo prebuild` for native access
- **Navigation** — React Navigation 7+: Stack, Tab, Drawer; type-safe with TypeScript
- **State** — Zustand for client state; TanStack Query v5 for server state
- **Styling** — `StyleSheet.create()` or NativeWind v4 (Tailwind CSS for RN)
- **Native modules** — Expo Modules API (recommended) or TurboModules for native bridge
- **OTA updates** — `expo-updates` for over-the-air JS bundle updates
- **New Architecture** — Fabric renderer + TurboModules enabled by default since 0.82

## Common Patterns
```tsx
// [nav] Type-safe stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```
```tsx
// [data] TanStack Query fetch pattern
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => fetch('/api/users').then(r => r.json()),
});
```

## Gotchas
- Always test on real devices — simulators hide performance issues
- Avoid inline styles in FlatList `renderItem` — causes unnecessary re-renders
- Use `keyExtractor` on all list components
- Legacy Architecture removed in 0.84 — all native modules must use TurboModules/Fabric
- Use `FlashList` (by Shopify) instead of `FlatList` for large lists — significantly better performance

## Security
- Use `expo-secure-store` or `react-native-keychain` for tokens — never AsyncStorage for secrets
- Enable certificate pinning with `react-native-ssl-pinning` to prevent MITM attacks
- Hermes compiles to bytecode by default — adds basic code obfuscation, but not a substitute for ProGuard/R8
- Never embed API keys in JS bundle — use a backend proxy or secure build-time injection
- Always use latest stable React Native / Expo version — run `npm audit` before deploy

## References
- https://reactnative.dev/docs/getting-started
- https://docs.expo.dev
- https://reactnavigation.org/docs/getting-started
- https://tanstack.com/query/latest
