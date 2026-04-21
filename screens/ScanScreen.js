import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';

const { height, width } = Dimensions.get('window');

export default function ScanScreen({ route }) {
  const navigation = useNavigation();
  const { theme } = useTheme();
  // Animação do scanner - começa do topo (0) e vai até o final (1)
  const scanProgress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);

  const { id, nome, idade, sexo, etnia, exame } = route.params;

  // Usa imagem customizada se existir
  const imagemExame = imagemCustomizada 
    ? { uri: imagemCustomizada } 
    : null;

  // Altura da área da imagem
  const IMAGE_HEIGHT = height * 0.45;

  useEffect(() => {
    // Animação de fade inicial
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Animação do scanner - revela de cima para baixo
    Animated.timing(scanProgress, {
      toValue: 1,
      duration: 4000,
      easing: Easing.linear,
      useNativeDriver: false, // Precisamos de false para animar height
    }).start();

    // Animação de pulso
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animação de brilho da linha de scan
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Atualizar progresso
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 80);

    const timer = setTimeout(() => {
      // Determina a tela de resultado baseada no tipo de exame
      let resultadoScreen = 'ResultadoColuna'; // Coluna Lombar é o padrão
      
      if (exame === 'Fêmur (Proximal)') {
        resultadoScreen = 'ResultadoFemur';
      } else if (exame === 'Punho (Antebraço)') {
        resultadoScreen = 'ResultadoPunho';
      } else if (exame === 'Corpo Total (Full Body)') {
        resultadoScreen = 'ResultadoCorpoTotal';
      }
      
      navigation.replace(resultadoScreen, {
        id,
        nome,
        idade,
        dataNascimento,
        peso,
        altura,
        sexo,
        etnia,
        exame,
        operador,
        imagemCustomizada,
        imagemHash,
      });
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  // Calcula a posição da linha de scan
  const scanLinePosition = scanProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, IMAGE_HEIGHT],
  });

  // Calcula a altura da área revelada (clip)
  const revealHeight = scanProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, IMAGE_HEIGHT],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background gradient effect */}
      <View style={styles.gradientOverlay} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.statusIndicator}>
          <Animated.View style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.statusText}>SCANNING IN PROGRESS</Text>
        </View>
      </Animated.View>

      {/* Image with scan reveal effect */}
      <Animated.View style={[styles.imageWrapper, { opacity: fadeAnim, height: IMAGE_HEIGHT }]}>
        {imagemExame ? (
          <>
            {/* Imagem completa por baixo (silhueta escura) */}
            <View style={styles.imageBackground}>
              <Image
                source={imagemExame}
                style={[styles.image, { opacity: 0.15 }]}
              />
            </View>

            {/* Área revelada pelo scanner (de cima para baixo) */}
            <Animated.View 
              style={[
                styles.revealContainer, 
                { 
                  height: revealHeight,
                  overflow: 'hidden',
                }
              ]}
            >
              <Image
                source={imagemExame}
                style={[styles.image, { height: IMAGE_HEIGHT }]}
              />
            </Animated.View>
          </>
        ) : (
          <View style={styles.noImageContainer}>
            <FontAwesome5 name="image" size={48} color="#4A5568" />
            <Text style={styles.noImageText}>Imagem indisponível</Text>
            <Text style={styles.noImageSubtext}>Nenhuma imagem foi adicionada</Text>
          </View>
        )}

        {/* Linha de scan com brilho */}
        <Animated.View
          style={[
            styles.scanLine,
            {
              opacity: glowAnim,
              transform: [{ translateY: scanLinePosition }],
            },
          ]}
        >
          {/* Efeito de glow na linha */}
          <View style={styles.scanLineGlow} />
          <View style={styles.scanLineCore} />
        </Animated.View>
        
        {/* Frame corners */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </Animated.View>

      {/* Status e informações */}
      <Animated.View style={[styles.infoContainer, { opacity: fadeAnim }]}>
        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <View style={styles.cardRow}>
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
              <FontAwesome5 name="wave-square" size={24} color="#4A90E2" />
            </Animated.View>
            <Text style={[styles.scanText, { color: theme.text }]}>Escaneando {exame}...</Text>
          </View>
          
          {/* Barra de progresso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.textMuted }]}>Progresso</Text>
              <Text style={styles.progressPercentage}>{progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { width: `${progress}%` }
                ]} 
              />
            </View>
          </View>

          {/* Informações do paciente */}
          <View style={styles.patientInfo}>
            <View style={styles.patientRow}>
              <FontAwesome5 name="user" size={14} color="#4A90E2" />
              <Text style={styles.patientLabel}>Paciente:</Text>
              <Text style={styles.patientValue}>{nome}</Text>
            </View>
            <View style={styles.patientRow}>
              <FontAwesome5 name="birthday-cake" size={14} color="#4A90E2" />
              <Text style={[styles.patientLabel, { color: theme.textMuted }]}>Idade:</Text>
              <Text style={[styles.patientValue, { color: theme.text }]}>{idade} anos</Text>
            </View>
            <View style={styles.patientRow}>
              <FontAwesome5 name="venus-mars" size={14} color="#4A90E2" />
              <Text style={[styles.patientLabel, { color: theme.textMuted }]}>Sexo:</Text>
              <Text style={[styles.patientValue, { color: theme.text }]}>{sexo}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0d14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74, 144, 226, 0.03)',
  },
  header: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
    zIndex: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginRight: 8,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  statusText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  imageWrapper: {
    width: '80%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 40,
  },
  imageBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  revealContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLineGlow: {
    position: 'absolute',
    width: '100%',
    height: 30,
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  scanLineCore: {
    width: '100%',
    height: 3,
    backgroundColor: '#4A90E2',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  image: {
    width: '100%',
    resizeMode: 'contain',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
  },
  noImageText: {
    color: '#8892B0',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  noImageSubtext: {
    color: '#4A5568',
    fontSize: 12,
    marginTop: 4,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#4A90E2',
  },
  topLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -1,
    right: -1,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    width: '90%',
  },
  infoCard: {
    backgroundColor: '#1a1d29',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scanText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressPercentage: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  patientInfo: {
    backgroundColor: 'rgba(74, 144, 226, 0.08)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  patientLabel: {
    color: '#999',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  patientValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});