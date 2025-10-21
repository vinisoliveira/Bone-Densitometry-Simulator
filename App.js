import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import CadastroScreen from './screens/CadastroScreen';
import ListaScreen from './screens/ListaScreen';
import ExameScreen from './screens/ExameScreen';
import SobreScreen from './screens/SobreScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [pacientes, setPacientes] = useState([]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />

        <Stack.Screen name="Cadastro">
          {(props) => (
            <CadastroScreen
              {...props}
              pacientes={pacientes}
              setPacientes={setPacientes}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Lista">
          {(props) => (
            <ListaScreen
              {...props}
              pacientes={pacientes}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Exame" component={ExameScreen} />
        <Stack.Screen name="Sobre" component={SobreScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
