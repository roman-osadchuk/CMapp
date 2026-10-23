import "@/utils/fetch-polyfill";

import { Stack } from "expo-router";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

// These are the default stack options for iOS, they disable on other platforms.
const DEFAULT_STACK_HEADER: NativeStackNavigationOptions =
  {
    headerTransparent: false,
    headerShadowVisible: true,
    headerLargeTitleShadowVisible: false,
  };

export default function Layout() {
  return (
    <Stack screenOptions={DEFAULT_STACK_HEADER}>
      <Stack.Screen
        name="index"
        options={{
          title: "Cash Mine",
        }}
      />
    </Stack>
  );
}
