import React from "react";
import {TransitionPresets, createStackNavigator} from "@react-navigation/stack";
import AuthTypes from "../screens/authTypes";
import Verification from "../screens/verification";
import GoogleAuth from "../screens/googleAuth";
const Stack = createStackNavigator();

const Navigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen name="AuthTypes" component={AuthTypes} />
      <Stack.Screen name="GoogleAuth" component={GoogleAuth} />
      <Stack.Screen name="Verification" component={Verification} />
    </Stack.Navigator>
  );
};

export default Navigator;
