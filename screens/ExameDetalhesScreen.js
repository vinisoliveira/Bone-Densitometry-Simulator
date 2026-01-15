import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { deletarPaciente } from '../utils/storage';

const ExameDetalheScreen = ({ route, navigation }) => {
  const { 
    id, 
    nome, 
    idade,
    dataNascimento,
    peso,
    altura, 
    sexo, 
    etnia, 
    exame, 
    vertebraSelecionada, 
    dataCriacao, 
    brightness = 100, 
    contrast = 100, 
    roiData,
    roiPositions = {},
    roiScale = 1,
    operador,
    imagemCustomizada,
    imagemHash,
  } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Memoizar dados computados para evitar recálculos
  const dadosExame = useMemo(() => {
    const dataFormatada = dataCriacao
      ? new Date(dataCriacao).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Data não disponível';

    // Usa imagem customizada se existir
    const imagemDoExame = imagemCustomizada 
      ? { uri: imagemCustomizada } 
      : null;

    return { imagemExame: imagemDoExame, dataFormatada };
  }, [dataCriacao, imagemCustomizada]);

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

  const handleDelete = async () => {
    // EXECUTAR EXCLUSÃO DIRETAMENTE SEM ALERT
    try {
      // Verificar dados antes da exclusão
      const { carregarPacientes } = require('../utils/storage');
      const antesExclusao = await carregarPacientes();
      
      // Executar a exclusão
      const resultado = await deletarPaciente(id);
      
      // Verificar após exclusão
      const aposExclusao = await carregarPacientes();
      
      // Navegar de volta para a lista
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      
      setTimeout(() => {
        navigation.navigate('Lista');
      }, 100);
      
    } catch (error) {
      console.error('❌ ERRO NA EXCLUSÃO:', error);
      console.error('❌ Stack:', error.stack);
    }
  };

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
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes do Exame</Text>
        <TouchableOpacity 
          style={styles.deleteHeaderButton} 
          onPress={handleDelete}
        >
          <FontAwesome5 name="trash-alt" size={20} color="#FF4444" />
        </TouchableOpacity>
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
              <InfoRow icon="birthday-cake" label="Idade" value={`${idade} anos`} />
              {dataNascimento && <InfoRow icon="calendar-alt" label="Data Nasc." value={dataNascimento} />}
              <InfoRow icon="venus-mars" label="Sexo" value={sexo} />
              <InfoRow icon="globe-americas" label="Etnia" value={etnia} />
              {peso && <InfoRow icon="weight" label="Peso" value={`${peso} kg`} />}
              {altura && <InfoRow icon="ruler-vertical" label="Altura" value={`${altura} cm`} />}
              {peso && altura && (
                <InfoRow 
                  icon="calculator" 
                  label="IMC" 
                  value={`${(parseFloat(peso) / Math.pow(parseFloat(altura)/100, 2)).toFixed(1)} kg/m²`} 
                />
              )}
            </View>
          </View>

          {/* Exam Info Card + Image Side by Side */}
          <View style={styles.examInfoRow}>
            {/* Exam Info */}
            <View style={[styles.card, styles.examInfoCard]}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="x-ray" size={24} color="#4A90E2" />
                <Text style={styles.cardTitle}>Informações do Exame</Text>
              </View>
              <View style={styles.cardContent}>
                <InfoRow icon="file-medical-alt" label="Tipo de Exame" value={exame} />
                <InfoRow
                  icon="map-marker-alt"
                  label="Região"
                  value={vertebraSelecionada || 'Não selecionada'}
                />
                <InfoRow icon="calendar" label="Data do Exame" value={dadosExame.dataFormatada} />
                {operador && <InfoRow icon="user-md" label="Operador" value={operador} />}
              </View>
            </View>

            {/* Exam Image */}
            <View style={[styles.card, styles.imageCard]}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="image" size={24} color="#4A90E2" />
                <Text style={styles.cardTitle}>Imagem do Exame</Text>
                {dadosExame.imagemExame && (
                  <TouchableOpacity
                    style={styles.editImageButton}
                    onPress={() => {
                      // Determina a tela de resultado baseada no tipo de exame
                      let resultadoScreen = 'ResultadoColuna';
                      if (exame === 'Fêmur (Proximal)') {
                        resultadoScreen = 'ResultadoFemur';
                      } else if (exame === 'Punho (Antebraço)') {
                        resultadoScreen = 'ResultadoPunho';
                      } else if (exame === 'Corpo Total (Full Body)') {
                        resultadoScreen = 'ResultadoCorpoTotal';
                      }
                      navigation.navigate(resultadoScreen, {
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
                        vertebraSelecionada,
                        brightness,
                        contrast,
                        roiData,
                        roiPositions,
                        roiScale,
                        dataCriacao,
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5 name="pencil-alt" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.imageContainer}>
                {dadosExame.imagemExame ? (
                  <View style={styles.squareImageWrapper}>
                    <Image
                      source={dadosExame.imagemExame}
                      style={[
                        styles.squareImage,
                        Platform.OS === 'web' && {
                          filter: `brightness(${brightness / 100}) contrast(${contrast / 100})`,
                        },
                        Platform.OS !== 'web' && {
                          opacity: brightness / 100,
                        },
                      ]}
                      resizeMode="cover"
                      progressiveRenderingEnabled={true}
                      fadeDuration={200}
                    />
                  </View>
                ) : (
                  <View style={styles.noImageContainerSmall}>
                    <FontAwesome5 name="image" size={32} color="#4A5568" />
                    <Text style={styles.noImageTextSmall}>Sem imagem</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate('Relatorio', {
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
                vertebraSelecionada,
                brightness,
                contrast,
                roiData,
              })
            }
            activeOpacity={0.8}
          >
            <FontAwesome5 name="file-alt" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Ver Relatório</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.navigate('Lista')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="list" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Ver Lista de Exames</Text>
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
  deleteHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
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
    flex: 1,
  },
  editImageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00897B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00897B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardContent: {
    padding: 16,
  },
  examInfoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    alignItems: 'stretch',
  },
  examInfoCard: {
    flex: 1,
    marginBottom: 0,
  },
  imageCard: {
    flex: 1,
    marginBottom: 0,
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
    minWidth: 110,
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
    justifyContent: 'center',
    flex: 1,
  },
  squareImageWrapper: {
    width: 160,
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#3a3f52',
  },
  squareImage: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  noImageContainerSmall: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#30363d',
    borderStyle: 'dashed',
  },
  noImageTextSmall: {
    color: '#8892B0',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#30363d',
    borderStyle: 'dashed',
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
    textAlign: 'center',
    paddingHorizontal: 20,
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
  buttonDanger: {
    backgroundColor: '#FF4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ExameDetalheScreen;
