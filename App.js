import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import { FontAwesome5 } from '@expo/vector-icons';
import { View, ActivityIndicator, Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

import HomeScreen from './screens/HomeScreen';
import CadastroScreen from './screens/CadastroScreen';
import ListaScreen from './screens/ListaScreen';
import ExameScreen from './screens/ExameScreen';
import ExameDetalhesScreen from './screens/ExameDetalhesScreen';
import SobreScreen from './screens/SobreScreen';
import ScanScreen from './screens/ScanScreen';
import ResultadoColunaScreen from './screens/ResultadoColunaScreen';
import ResultadoFemurScreen from './screens/ResultadoFemurScreen';
import ResultadoPunhoScreen from './screens/ResultadoPunhoScreen';
import ResultadoCorpoTotalScreen from './screens/ResultadoCorpoTotalScreen';
import RelatorioScreen from './screens/RelatorioScreen';
import ConfiguracoesScreen from './screens/ConfiguracoesScreen';
import BackupsScreen from './screens/BackupsScreen';
import PrivacidadeScreen from './screens/PrivacidadeScreen';
import TermosDeUsoScreen from './screens/TermosDeUsoScreen';
import ManualScreen from './screens/ManualScreen';
import { ThemeProvider } from './src/contexts/ThemeContext';

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

    // Travar orientação em retrato para todos os dispositivos (Samsung, iPhone, etc.)
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {
        // Fallback: tenta PORTRAIT genérico caso PORTRAIT_UP não funcione (alguns Samsung)
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(() => {});
      });
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1d29' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ThemeProvider>
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
        <Stack.Screen name="Backups" component={BackupsScreen} />
        <Stack.Screen name="Privacidade" component={PrivacidadeScreen} />
        <Stack.Screen name="TermosDeUso" component={TermosDeUsoScreen} />
        <Stack.Screen name="Manual" component={ManualScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="ResultadoColuna" component={ResultadoColunaScreen} />
        <Stack.Screen name="ResultadoFemur" component={ResultadoFemurScreen} />
        <Stack.Screen name="ResultadoPunho" component={ResultadoPunhoScreen} />
        <Stack.Screen name="ResultadoCorpoTotal" component={ResultadoCorpoTotalScreen} />
        <Stack.Screen
          name="Relatorio"
          component={RelatorioScreen}
        />
  
      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>
  );
}
