import { Fragment, useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import Constants from 'expo-constants';

const API_KEY = Constants?.expoConfig?.extra?.API_KEY;

export function App() {

  return (
    <>
      <Text>Hello</Text>
    </>
  );
}

