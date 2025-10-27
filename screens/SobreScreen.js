import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';


const SobreScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flask" size={28} color="#00e6e6" />
        <Text style={styles.title}>Sobre o Projeto</Text>
      </View>

      <Text style={styles.sectionTitle}>🧠 Propósito</Text>
      <Text style={styles.text}>
        Este projeto é voltado para visualização e organização de exames de imagem, com foco em radiografias da coluna e membros. Ele simula o ambiente de um laboratório moderno, oferecendo uma experiência imersiva e funcional.
      </Text>

      <Text style={styles.sectionTitle}>🛠️ Tecnologias</Text>
      <Text style={styles.text}>
        • React Native{'\n'}
        • Expo{'\n'}
        • React Navigation{'\n'}
        
      </Text>

      <Text style={styles.sectionTitle}>👨‍💻 Desenvolvedores</Text>
      <Text style={styles.text}>
        • Bernardo Nascimento{'\n'}
        • Vinícius Oliveira{'\n'}
        • Fernando Vinícius
      </Text>

      <Text style={styles.sectionTitle}>🔬 Turma Radiologia</Text>
      <Text style={styles.text}>
        Nome
        Nome
        Nome
        Nome
        Nome
        Nome
        Nome
        Nome
        Nome
        Nome
        Nome
        Nome
        Nome
        Nome
        Nome
        </Text>
        
        <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="home" size={20} color="#00e6e6" style={styles.icon} />
        <Text style={styles.buttonText}>  Voltar para Início</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f44',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#e6f2ff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionTitle: {
    color: '#00e6e6',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  text: {
    color: '#e6f2ff',
    fontSize: 16,
    lineHeight: 22,
  },
  homeButton: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  }
});

export default SobreScreen;
