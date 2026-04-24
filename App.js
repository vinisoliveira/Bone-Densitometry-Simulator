import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import { FontAwesome5 } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import CadastroScreen from './screens/CadastroScreen';
import ListaScreen from './screens/ListaScreen';
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
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          ...FontAwesome5.font,
        });
      } catch (e) {
        if (__DEV__) console.warn('Erro ao carregar fontes:', e);
      } finally {
        setFontsLoaded(true);
      }
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
    <SafeAreaProvider>
      <ThemeProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1d29' }} edges={['top', 'bottom', 'left', 'right']}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Cadastro" component={CadastroScreen} />
              <Stack.Screen name="Lista" component={ListaScreen} />
              <Stack.Screen name="ExameDetalhe" component={ExameDetalhesScreen} />
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
              <Stack.Screen name="Relatorio" component={RelatorioScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
