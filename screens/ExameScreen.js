import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';

const ExameScreen = ({ route, navigation }) => {
  const { id, nome, idade, sexo, etnia, exame } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in da tela
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Revelação progressiva da imagem
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false, // altura não suporta useNativeDriver
    }).start();
  }, []);

  const nomeExame =
    exame === 'coluna_lombar_ap.jpg'
      ? 'Coluna lombar AP'
      : exame === 'femur_esquerdo.jpg'
      ? 'Fêmur esquerdo'
      : exame;

  const imagemExame =
    exame === 'coluna_lombar_ap.jpg'
      ? require('../assets/coluna_lombar_ap.jpg')
      : exame === 'femur_esquerdo.jpg'
      ? require('../assets/femur_esquerdo.jpg')
      : null;

  const maskHeight = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // altura total da imagem
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Ionicons name="medkit" size={28} color="#00e6e6" />
        <Text style={styles.title}>Detalhes do Exame</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Paciente</Text>
        <Text style={styles.value}>{nome}</Text>

        <Text style={styles.label}>ID</Text>
        <Text style={styles.value}>{id}</Text>

        <Text style={styles.label}>Idade</Text>
        <Text style={styles.value}>{idade} anos</Text>

        <Text style={styles.label}>Sexo</Text>
        <Text style={styles.value}>{sexo}</Text>

        <Text style={styles.label}>Etnia</Text>
        <Text style={styles.value}>{etnia}</Text>

        <Text style={styles.label}>Tipo de exame</Text>
        <Text style={styles.value}>{nomeExame}</Text>

        {imagemExame && (
          <MaskedView
            style={styles.imageWrapper}
            maskElement={
              <Animated.View style={{ height: maskHeight, width: '100%', backgroundColor: 'black' }} />
            }
          >
            <Image source={imagemExame} style={styles.image} resizeMode="contain" />
          </MaskedView>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Lista')}
      >
        <Ionicons name="list" size={20} color="#00e6e6" style={styles.icon} />
        <Text style={styles.buttonText}>Ver lista de exames</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="home" size={20} color="#00e6e6" style={styles.icon} />
        <Text style={styles.buttonText}>Voltar para Início</Text>
      </TouchableOpacity>
    </Animated.View>
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
  card: {
    backgroundColor: '#1e2a38',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  label: {
    color: '#00e6e6',
    fontSize: 14,
    marginTop: 15,
  },
  value: {
    color: '#e6f2ff',
    fontSize: 16,
    marginTop: 5,
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  homeButton: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#e6f2ff',
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
});

export default ExameScreen;
