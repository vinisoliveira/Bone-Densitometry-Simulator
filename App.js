import React, { useState, lazy, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text } from 'react-native';

// Importação imediata apenas da tela principal
import HomeScreen from './screens/HomeScreen';

// Lazy loading das outras telas
const CadastroScreen = lazy(() => import('./screens/CadastroScreen'));
const ListaScreen = lazy(() => import('./screens/ListaScreen'));
const ExameScreen = lazy(() => import('./screens/ExameScreen'));
const SobreScreen = lazy(() => import('./screens/SobreScreen'));
const ScanScreen = lazy(() => import('./screens/ScanScreen'));
const ResultadoScreen = lazy(() => import('./screens/ResultadoScreen'));
const RelatorioScreen = lazy(() => import('./screens/RelatorioScreen'));

const Stack = createNativeStackNavigator();

// Componente de loading
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a1f44' }}>
    <ActivityIndicator size="large" color="#00e6e6" />
    <Text style={{ color: '#e6f2ff', marginTop: 10 }}>Carregando...</Text>
  </View>
);

export default function App() {
  const [pacientes, setPacientes] = useState([]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />

        <Stack.Screen name="Cadastro">
          {(props) => (
            <Suspense fallback={<LoadingScreen />}>
              <CadastroScreen
                {...props}
                pacientes={pacientes}
                setPacientes={setPacientes}
              />
            </Suspense>
          )}
        </Stack.Screen>

        <Stack.Screen name="Lista">
          {(props) => (
            <Suspense fallback={<LoadingScreen />}>
              <ListaScreen
                {...props}
                pacientes={pacientes}
              />
            </Suspense>
          )}
        </Stack.Screen>

        <Stack.Screen name="Exame">
          {(props) => (
            <Suspense fallback={<LoadingScreen />}>
              <ExameScreen {...props} />
            </Suspense>
          )}
        </Stack.Screen>

        <Stack.Screen name="Sobre">
          {(props) => (
            <Suspense fallback={<LoadingScreen />}>
              <SobreScreen {...props} />
            </Suspense>
          )}
        </Stack.Screen>

        <Stack.Screen name="Scan">
          {(props) => (
            <Suspense fallback={<LoadingScreen />}>
              <ScanScreen {...props} />
            </Suspense>
          )}
        </Stack.Screen>

        <Stack.Screen name="Resultado">
          {(props) => (
            <Suspense fallback={<LoadingScreen />}>
              <ResultadoScreen {...props} />
            </Suspense>
          )}
        </Stack.Screen>

        <Stack.Screen name="Relatorio">
          {(props) => (
            <Suspense fallback={<LoadingScreen />}>
              <RelatorioScreen {...props} />
            </Suspense>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
