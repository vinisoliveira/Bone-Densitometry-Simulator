import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ScrollView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const ExameScreen = ({ route, navigation }) => {
  const { id, nome, idade, sexo, etnia, exame } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Memoizar dados computados para evitar recálculos
  const dadosExame = useMemo(() => {
    const nomeExame =
      exame === 'coluna_lombar_ap.jpg'
        ? 'Coluna lombar AP'
        : exame === 'femur_esquerdo.jpg'
        ? 'Fêmur esquerdo'
        : exame;

  const imagemExame =
    exame === 'coluna_lombar_ap.jpg'
      ? require('../assets/coluna_lombar_ap.jpg')
      : exame === 'femur.jpeg'
      ? require('../assets/femur.jpeg')
      : null;

    return { nomeExame, imagemExame };
  }, [exame]);

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

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <FontAwesome5 name={icon} size={14} color="#4A90E2" />
      </View>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
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
        <Text style={styles.title}>Detalhes do Exame</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Patient Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="user-circle" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Informações do Paciente</Text>
            </View>
            <View style={styles.cardContent}>
              <InfoRow icon="user" label="Paciente" value={nome} />
              <InfoRow icon="hashtag" label="ID" value={id} />
              <InfoRow icon="birthday-cake" label="Idade" value={`${idade} anos`} />
              <InfoRow icon="venus-mars" label="Sexo" value={sexo} />
              <InfoRow icon="globe-americas" label="Etnia" value={etnia} />
              <InfoRow icon="x-ray" label="Tipo de Exame" value={dadosExame.nomeExame} />
            </View>
          </View>

          {/* Exam Image */}
          {dadosExame.imagemExame && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="image" size={24} color="#4A90E2" />
                <Text style={styles.cardTitle}>Imagem do Exame</Text>
              </View>
              <View style={styles.imageContainer}>
                <Image 
                  source={dadosExame.imagemExame} 
                  style={styles.image} 
                  resizeMode="contain" 
                  progressiveRenderingEnabled={true}
                  fadeDuration={200}
                />
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Lista')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="list" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Ver Lista de Exames</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="home" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#2a3142',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3f52',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  imageContainer: {
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: '#667eea',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ExameScreen;
