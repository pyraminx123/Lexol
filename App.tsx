import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// screens
import HomeScreen from './screens/HomeScreen.tsx';
import FlashcardsScreen from './screens/FlashcardsScreen.tsx';
import AddCardsScreen from './screens/TestScreen.tsx';
import SetsScreen from './screens/SetsScreen.tsx';

const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Flashcards" component={FlashcardsScreen} />
        <Stack.Screen name="Add" component={AddCardsScreen} />
        <Stack.Screen name="Set" component={SetsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MyStack;
