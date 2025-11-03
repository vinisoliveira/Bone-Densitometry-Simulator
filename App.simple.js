import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  console.log('=== APP RENDERIZANDO ===');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>TESTE - App Funcionando!</Text>
      <Text style={styles.subtext}>Se você vê isso, o React Native Web está OK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});
