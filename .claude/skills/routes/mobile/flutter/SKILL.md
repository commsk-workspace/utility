# Flutter — SKILL

## Overview
Cross-platform UI framework by Google using Dart. Single codebase for iOS, Android, Web, Desktop.
Flutter 3.41+ with Dart 3.7+ supports patterns, sealed classes, macros (experimental), and improved compilation.

## Setup / Base Project
```bash
# Install via official installer or package manager
flutter --version          # Verify installation
flutter create my_app      # New project
flutter create --template=package my_lib  # Package/library
cd my_app && flutter run   # Run on connected device
```

## Core Concepts
- **Widget tree** — Everything is a widget: StatelessWidget, StatefulWidget, InheritedWidget
- **State management** — Riverpod 2.x (recommended) with code generation; Bloc/Cubit as alternative
- **Navigation** — GoRouter for declarative routing with deep linking and type-safe routes
- **Async** — `Future`, `Stream`, `async/await`; use `FutureBuilder`/`StreamBuilder` in UI
- **Theming** — `ThemeData` + `ColorScheme.fromSeed()` for Material 3 (default since Flutter 3.16+)
- **Firebase** — `flutterfire configure` to auto-generate platform configs
- **Testing** — `flutter test` for unit/widget tests; `integration_test` package for E2E

## Common Patterns
```dart
// [state] Riverpod provider with AsyncNotifier (code-gen)
@riverpod
class UserList extends _$UserList {
  @override
  Future<List<User>> build() => fetchUsers();
  Future<void> refresh() async { state = await AsyncValue.guard(fetchUsers); }
}
```
```dart
// [nav] GoRouter type-safe declarative route
final router = GoRouter(routes: [
  GoRoute(path: '/', builder: (ctx, state) => const HomeScreen()),
  GoRoute(path: '/user/:id', builder: (ctx, state) => UserScreen(id: state.pathParameters['id']!)),
]);
```

## Gotchas
- Always dispose controllers (`TextEditingController`, `AnimationController`)
- Avoid heavy computation on main isolate — use `Isolate.run()` or `compute()`
- `setState` only works for local widget state; do not use for shared/app state
- Hot reload does not work after changing `main()` or static fields — use hot restart
- Use `const` constructors wherever possible to optimize widget rebuilds

## Security
- Use `flutter_secure_storage` for tokens and secrets — never store in SharedPreferences
- Enable certificate pinning for API calls to prevent MITM attacks
- Obfuscate release builds: `flutter build apk --obfuscate --split-debug-info=./debug-info`
- Never embed API keys in Dart source — use `--dart-define` or a backend proxy
- Always use latest stable Flutter/Dart version — run `flutter pub audit` before deploy

## References
- https://flutter.dev/docs
- https://riverpod.dev
- https://pub.dev/packages/go_router
- https://firebase.google.com/docs/flutter/setup
