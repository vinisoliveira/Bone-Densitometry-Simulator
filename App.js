import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Importar as telas
import HomeScreen from './screens/HomeScreen';
import ListaScreen from './screens/ListaScreen';
import CadastroScreen from './screens/CadastroScreen';
import ScanScreen from './screens/ScanScreen';
import SobreScreen from './screens/SobreScreen';
import ConfiguracoesScreen from './screens/ConfiguracoesScreen';

const Stack = createNativeStackNavigator();

// Telas placeholder para as que ainda não foram recriadas
const PlaceholderScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.placeholder, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.placeholderTitle, { color: theme.colors.text }]}>
        Tela: {route.name}
      </Text>
      <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
        Em desenvolvimento
      </Text>
      <Text 
        style={[styles.backLink, { color: theme.colors.primary }]}
        onPress={() => navigation.goBack()}
      >
        ← Voltar
      </Text>
    </View>
  );
};

function AppNavigator() {
  const { theme, isLoading: themeLoading } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    console.log('=== APP INICIADO ===');
    console.log('Platform:', Platform.OS);
    
    // Inicialização
    const timer = setTimeout(() => {
      setIsReady(true);
      console.log('App pronto!');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (themeLoading || !isReady) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.colors.background === '#0F172A',
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.accent,
        },
      }}
    >
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
        />
        <Stack.Screen name="Lista">
          {props => <ListaScreen {...props} pacientes={pacientes} setPacientes={setPacientes} />}
        </Stack.Screen>
        <Stack.Screen name="Cadastro">
          {props => <CadastroScreen {...props} pacientes={pacientes} setPacientes={setPacientes} />}
        </Stack.Screen>
        <Stack.Screen 
          name="Scan" 
          component={ScanScreen}
        />
        <Stack.Screen 
          name="Sobre" 
          component={SobreScreen}
        />
        <Stack.Screen 
          name="Configuracoes" 
          component={ConfiguracoesScreen}
        />
        <Stack.Screen 
          name="Exame" 
          component={PlaceholderScreen}
        />
        <Stack.Screen 
          name="Resultado" 
          component={PlaceholderScreen}
        />
        <Stack.Screen 
          name="Relatorio" 
          component={PlaceholderScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    marginBottom: 30,
  },
  backLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});
