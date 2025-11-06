import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { colors, spacing, typography } from '../src/styles/theme';
import { useNavigation } from '@react-navigation/native';
import { salvarPaciente } from '../utils/storage';
import { FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ResultadoScreen({ route }) {
  const { id, nome, idade, sexo, etnia, exame } = route.params;
  const [selectedId, setSelectedId] = useState(null);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const saveSuccessAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Imagens por exame
  const imagemExame = {
    'Coluna Lombar': require('../assets/coluna-lombar.jpeg'),
    'Fêmur': require('../assets/femur.jpeg'),
    'Punho': require('../assets/punho.jpg'),
  };

  // Regiões interativas por exame (ajustadas para o novo tamanho)
  const imageWidth = width - 40;
  const imageHeight = height * 0.5;
  
  const regioesPorExame = {
    'Coluna Lombar': [
      { id: 'L1', x: imageWidth * 0.32, y: imageHeight * 0.08, width: imageWidth * 0.36, height: imageHeight * 0.14 },
      { id: 'L2', x: imageWidth * 0.32, y: imageHeight * 0.24, width: imageWidth * 0.36, height: imageHeight * 0.14 },
      { id: 'L3', x: imageWidth * 0.32, y: imageHeight * 0.40, width: imageWidth * 0.36, height: imageHeight * 0.14 },
      { id: 'L4', x: imageWidth * 0.32, y: imageHeight * 0.56, width: imageWidth * 0.36, height: imageHeight * 0.14 },
    ],
    'Fêmur': [
      { id: 'Cabeça Femoral', x: imageWidth * 0.30, y: imageHeight * 0.10, width: imageWidth * 0.40, height: imageHeight * 0.18 },
      { id: 'Diáfise', x: imageWidth * 0.30, y: imageHeight * 0.35, width: imageWidth * 0.40, height: imageHeight * 0.25 },
    ],
    'Punho': [
      { id: 'Rádio', x: imageWidth * 0.27, y: imageHeight * 0.15, width: imageWidth * 0.46, height: imageHeight * 0.20 },
      { id: 'Ulna', x: imageWidth * 0.27, y: imageHeight * 0.40, width: imageWidth * 0.46, height: imageHeight * 0.20 },
    ],
  };

  const regioes = regioesPorExame[exame] || [];
  const regiaoSelecionada = regioes.find((r) => r.id === selectedId);

  const handleSave = async () => {
    setShowSaveAnimation(true);
    
    Animated.sequence([
      Animated.spring(saveSuccessAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // SALVA o paciente com o exame completo
    const pacienteCompleto = {
      id,
      nome,
      idade,
      sexo,
      etnia,
      exame,
      vertebraSelecionada: selectedId,
      dataCriacao: new Date().toISOString(),
    };

    await salvarPaciente(pacienteCompleto);
    
    setTimeout(() => {
      saveSuccessAnim.setValue(0);
      setShowSaveAnimation(false);
      // Navega para a lista de exames após salvar
      navigation.navigate('Lista');
    }, 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.title}>GLOBAL ROI {exame}</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      {/* Info Box */}
      <Animated.View 
        style={[
          styles.infoBox,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <FontAwesome5 name="user" size={12} color="#4A90E2" />
          </View>
          <Text style={styles.infoLabel}>Paciente:</Text>
          <Text style={styles.infoValue}>{nome}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <FontAwesome5 name="birthday-cake" size={12} color="#4A90E2" />
          </View>
          <Text style={styles.infoLabel}>Idade:</Text>
          <Text style={styles.infoValue}>{idade}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <FontAwesome5 name="venus-mars" size={12} color="#4A90E2" />
          </View>
          <Text style={styles.infoLabel}>Sexo:</Text>
          <Text style={styles.infoValue}>{sexo}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <FontAwesome5 name="globe-americas" size={12} color="#4A90E2" />
          </View>
          <Text style={styles.infoLabel}>Etnia:</Text>
          <Text style={styles.infoValue}>{etnia}</Text>
        </View>
      </Animated.View>

      {/* Image with Zoom */}
      <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
        <ImageZoom
          cropWidth={width - 40}
          cropHeight={height * 0.5}
          imageWidth={width - 40}
          imageHeight={height * 0.5}
        >
          <View style={styles.imageWrapper}>
            <Image source={imagemExame[exame]} style={styles.image} />
            {regioes.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={{
                  position: 'absolute',
                  left: r.x,
                  top: r.y,
                  width: r.width,
                  height: r.height,
                  borderWidth: selectedId === r.id ? 3 : 2,
                  borderColor: selectedId === r.id ? '#4A90E2' : 'rgba(74, 144, 226, 0.5)',
                  backgroundColor: selectedId === r.id ? 'rgba(74, 144, 226, 0.2)' : 'transparent',
                  borderRadius: 4,
                }}
                onPress={() => setSelectedId(r.id)}
              />
            ))}

            {regiaoSelecionada && (
              <View
                style={{
                  position: 'absolute',
                  left: regiaoSelecionada.x,
                  top: regiaoSelecionada.y - 25,
                  backgroundColor: '#4A90E2',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}
              >
                <Text style={styles.labelText}>{regiaoSelecionada.id}</Text>
              </View>
            )}
          </View>
        </ImageZoom>
      </Animated.View>

      {/* Controls */}
      <Animated.View 
        style={[
          styles.controls,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="save" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Salvar Exame</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() =>
            navigation.navigate('Relatorio', {
              id,
              nome,
              idade,
              sexo,
              etnia,
              exame,
              vertebraSelecionada: selectedId,
            })
          }
          activeOpacity={0.8}
        >
          <FontAwesome5 name="file-alt" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Ver Relatório</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Save Success Animation */}
      {showSaveAnimation && (
        <View style={styles.saveOverlay}>
          <Animated.View
            style={[
              styles.saveCircle,
              {
                transform: [{ scale: saveSuccessAnim }],
                opacity: saveSuccessAnim,
              },
            ]}
          >
            <FontAwesome5 name="check" size={40} color="#FFFFFF" />
          </Animated.View>
          <Animated.Text
            style={[
              styles.saveText,
              {
                opacity: saveSuccessAnim,
              },
            ]}
          >
            Exame Salvo!
          </Animated.Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a3142',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  infoBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#2a3142',
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    minWidth: 70,
  },
  infoValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imageWrapper: {
    width: width - 40,
    height: height * 0.5,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  labelText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  controls: {
    paddingHorizontal: 20,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
  },
  buttonSecondary: {
    backgroundColor: '#667eea',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 29, 41, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  saveCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  saveText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
  },
});