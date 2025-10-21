import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bone Densitometry Simulator</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Lista')}
      >
        <Ionicons name="people" size={24} color="#00e6e6" style={styles.icon} />
        <Text style={styles.buttonText}>Pacientes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Cadastro')}
      >
        <Ionicons name="add-circle" size={24} color="#00e6e6" style={styles.icon} />
        <Text style={styles.buttonText}>Adicionar Exame</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Sobre')}
      >
        <Ionicons name="information-circle" size={24} color="#00e6e6" style={styles.icon} />
        <Text style={styles.buttonText}>Sobre</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f44',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    color: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#1e2a38',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#e6f2ff',
    fontSize: 18,
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
});

export default HomeScreen;
