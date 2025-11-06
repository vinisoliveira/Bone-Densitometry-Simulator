import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import { FontAwesome5 } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import CadastroScreen from './screens/CadastroScreen';
import ListaScreen from './screens/ListaScreen';
import ExameScreen from './screens/ExameScreen';
import ExameDetalhesScreen from './screens/ExameDetalhesScreen';
import SobreScreen from './screens/SobreScreen';
import ScanScreen from './screens/ScanScreen';
import ResultadoScreen from './screens/ResultadoScreen';
import RelatorioScreen from './screens/RelatorioScreen';
import ConfiguracoesScreen from './screens/ConfiguracoesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [pacientes, setPacientes] = useState([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        ...FontAwesome5.font,
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1d29' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

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
        
        <Stack.Screen name="ExameDetalhe">
          {(props) => (
            <ExameDetalhesScreen
              {...props}
              pacientes={pacientes}
              setPacientes={setPacientes}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen name="Sobre" component={SobreScreen} />
        <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="Resultado" component={ResultadoScreen} />
        <Stack.Screen
          name="Relatorio"
          component={RelatorioScreen}
        />
  
      </Stack.Navigator>
    </NavigationContainer>
  );
}
