import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated, Platform, Dimensions } from 'react-native';
import { Print } from 'expo-print';
import { colors, spacing, typography } from '../src/styles/theme';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function RelatorioScreen({ route, navigation }) {
  const { 
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
    brightness = 100, 
    contrast = 100, 
    roiData 
  } = route.params;

  // Calcular IMC
  const imc = peso && altura ? (parseFloat(peso) / Math.pow(parseFloat(altura)/100, 2)).toFixed(1) : null;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const gerarPDF = async () => {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4A90E2; }
            .info { margin: 10px 0; }
            strong { color: #333; }
          </style>
        </head>
        <body>
          <h1>Relatório de Densitometria Óssea</h1>
          <div class="info"><strong>Paciente:</strong> ${nome}</div>
          <div class="info"><strong>Idade:</strong> ${idade}</div>
          <div class="info"><strong>Sexo:</strong> ${sexo}</div>
          <div class="info"><strong>Etnia:</strong> ${etnia}</div>
          <div class="info"><strong>Exame:</strong> ${exame}</div>
          <div class="info"><strong>Região Selecionada:</strong> ${vertebraSelecionada || 'Nenhuma'}</div>
          <p><em>Relatório gerado automaticamente pelo sistema.</em></p>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      alert('✅ PDF gerado com sucesso!\n\nLocal: ' + uri);
    } catch (error) {
      alert('❌ Erro ao gerar PDF');
    }
  };

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
        <Text style={styles.title}>Relatório do Exame</Text>
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
              <Text style={styles.cardTitle}>Dados do Paciente</Text>
            </View>
            <View style={styles.cardContent}>
              {/* Info Grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoGridItem}>
                  <FontAwesome5 name="user" size={16} color="#4A90E2" />
                  <Text style={styles.infoGridLabel}>Paciente</Text>
                  <Text style={styles.infoGridValue}>{nome || '-'}</Text>
                </View>
                <View style={styles.infoGridItem}>
                  <FontAwesome5 name="birthday-cake" size={16} color="#4A90E2" />
                  <Text style={styles.infoGridLabel}>Idade</Text>
                  <Text style={styles.infoGridValue}>{idade ? `${idade} anos` : '-'}</Text>
                </View>
                <View style={styles.infoGridItem}>
                  <FontAwesome5 name="venus-mars" size={16} color="#4A90E2" />
                  <Text style={styles.infoGridLabel}>Sexo</Text>
                  <Text style={styles.infoGridValue}>{sexo || '-'}</Text>
                </View>
                <View style={styles.infoGridItem}>
                  <FontAwesome5 name="globe-americas" size={16} color="#4A90E2" />
                  <Text style={styles.infoGridLabel}>Etnia</Text>
                  <Text style={styles.infoGridValue}>{etnia || '-'}</Text>
                </View>
              </View>

              {/* Physical Data - if available */}
              {(peso || altura) && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoGrid}>
                    {peso && (
                      <View style={styles.infoGridItem}>
                        <FontAwesome5 name="weight" size={16} color="#4A90E2" />
                        <Text style={styles.infoGridLabel}>Peso</Text>
                        <Text style={styles.infoGridValue}>{peso} kg</Text>
                      </View>
                    )}
                    {altura && (
                      <View style={styles.infoGridItem}>
                        <FontAwesome5 name="ruler-vertical" size={16} color="#4A90E2" />
                        <Text style={styles.infoGridLabel}>Altura</Text>
                        <Text style={styles.infoGridValue}>{altura} cm</Text>
                      </View>
                    )}
                    {imc && (
                      <View style={styles.infoGridItem}>
                        <FontAwesome5 name="calculator" size={16} color="#4A90E2" />
                        <Text style={styles.infoGridLabel}>IMC</Text>
                        <Text style={styles.infoGridValue}>{imc} kg/m²</Text>
                      </View>
                    )}
                    {dataNascimento && (
                      <View style={styles.infoGridItem}>
                        <FontAwesome5 name="calendar-alt" size={16} color="#4A90E2" />
                        <Text style={styles.infoGridLabel}>Data Nasc.</Text>
                        <Text style={styles.infoGridValue}>{dataNascimento}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
              
              <View style={styles.divider} />
              
              {/* Exam Info */}
              <View style={styles.examInfoRow}>
                <View style={styles.examInfoItem}>
                  <View style={styles.examInfoIcon}>
                    <FontAwesome5 name="x-ray" size={18} color="#4A90E2" />
                  </View>
                  <View>
                    <Text style={styles.examInfoLabel}>Tipo de Exame</Text>
                    <Text style={styles.examInfoValue}>{exame || '-'}</Text>
                  </View>
                </View>
                <View style={styles.examInfoItem}>
                  <View style={styles.examInfoIcon}>
                    <FontAwesome5 name="map-marker-alt" size={18} color="#4A90E2" />
                  </View>
                  <View>
                    <Text style={styles.examInfoLabel}>Região Analisada</Text>
                    <Text style={styles.examInfoValue}>{roiData?.id || vertebraSelecionada || 'Não analisada'}</Text>
                  </View>
                </View>
              </View>

              {/* Operator info if available */}
              {operador && (
                <View style={[styles.examInfoRow, { marginTop: 10 }]}>
                  <View style={styles.examInfoItem}>
                    <View style={styles.examInfoIcon}>
                      <FontAwesome5 name="user-md" size={18} color="#4A90E2" />
                    </View>
                    <View>
                      <Text style={styles.examInfoLabel}>Operador/Técnico</Text>
                      <Text style={styles.examInfoValue}>{operador}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* DXA Results Card - Only if roiData exists */}
          {roiData && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="chart-line" size={24} color="#4A90E2" />
                <Text style={styles.cardTitle}>Resultados da Análise DXA</Text>
              </View>
              <View style={styles.cardContent}>
                {/* Metrics Row */}
                <View style={styles.metricsContainer}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>BMD</Text>
                    <Text style={styles.metricValue}>{roiData.bmd?.toFixed(3) || '-'}</Text>
                    <Text style={styles.metricUnit}>g/cm²</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>T-Score</Text>
                    <Text style={[
                      styles.metricValue, 
                      { color: roiData.tScore >= -1 ? '#66BB6A' : roiData.tScore >= -2.5 ? '#FFCA28' : '#EF5350' }
                    ]}>
                      {roiData.tScore?.toFixed(1) || '-'}
                    </Text>
                    <Text style={styles.metricUnit}>SD</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>Z-Score</Text>
                    <Text style={styles.metricValue}>{roiData.zScore?.toFixed(1) || '-'}</Text>
                    <Text style={styles.metricUnit}>SD</Text>
                  </View>
                </View>
                
                {/* Diagnosis Badge */}
                <View style={[
                  styles.diagnosisBadge,
                  { 
                    backgroundColor: roiData.tScore >= -1 
                      ? 'rgba(102, 187, 106, 0.2)' 
                      : roiData.tScore >= -2.5 
                        ? 'rgba(255, 202, 40, 0.2)' 
                        : 'rgba(239, 83, 80, 0.2)',
                    borderColor: roiData.tScore >= -1 ? '#66BB6A' : roiData.tScore >= -2.5 ? '#FFCA28' : '#EF5350'
                  }
                ]}>
                  <FontAwesome5 
                    name={roiData.tScore >= -1 ? 'check-circle' : roiData.tScore >= -2.5 ? 'exclamation-triangle' : 'times-circle'} 
                    size={20} 
                    color={roiData.tScore >= -1 ? '#66BB6A' : roiData.tScore >= -2.5 ? '#FFCA28' : '#EF5350'} 
                  />
                  <Text style={[
                    styles.diagnosisText,
                    { color: roiData.tScore >= -1 ? '#66BB6A' : roiData.tScore >= -2.5 ? '#FFCA28' : '#EF5350' }
                  ]}>
                    {roiData.tScore >= -1 ? 'Normal' : roiData.tScore >= -2.5 ? 'Osteopenia' : 'Osteoporose'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Scanner Image */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="image" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Imagem do Scanner</Text>
            </View>
            <View style={styles.scannerImageContainer}>
              {imagemCustomizada ? (
                <Image 
                  source={{ uri: imagemCustomizada }} 
                  style={[
                    styles.scannerImage,
                    Platform.OS === 'web' && {
                      filter: `brightness(${brightness / 100}) contrast(${contrast / 100})`,
                    },
                    Platform.OS !== 'web' && {
                      opacity: brightness / 100,
                    },
                  ]}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.noImageContainer}>
                  <FontAwesome5 name="image" size={48} color="#4A5568" />
                  <Text style={styles.noImageText}>Imagem indisponível</Text>
                  <Text style={styles.noImageSubtext}>Nenhuma imagem foi adicionada</Text>
                </View>
              )}
            </View>
            {roiData && (
              <View style={styles.roiInfo}>
                <Text style={styles.roiInfoTitle}>Análise ROI: {roiData.id}</Text>
                <View style={styles.roiMetricsRow}>
                  <View style={styles.roiMetricBox}>
                    <Text style={styles.roiMetricLabel}>BMD</Text>
                    <Text style={styles.roiMetricValue}>{roiData.bmd?.toFixed(3) || '-'}</Text>
                    <Text style={styles.roiMetricUnit}>g/cm²</Text>
                  </View>
                  <View style={styles.roiMetricBox}>
                    <Text style={styles.roiMetricLabel}>T-Score</Text>
                    <Text style={[styles.roiMetricValue, { color: roiData.tScore >= -1 ? '#4CAF50' : roiData.tScore >= -2.5 ? '#FFC107' : '#F44336' }]}>{roiData.tScore?.toFixed(1) || '-'}</Text>
                    <Text style={styles.roiMetricUnit}>SD</Text>
                  </View>
                  <View style={styles.roiMetricBox}>
                    <Text style={styles.roiMetricLabel}>Z-Score</Text>
                    <Text style={styles.roiMetricValue}>{roiData.zScore?.toFixed(1) || '-'}</Text>
                    <Text style={styles.roiMetricUnit}>SD</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Dynamic T-Score Chart */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="chart-line" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Gráfico de Densitometria</Text>
            </View>
            <View style={styles.chartContainer}>
              {/* Chart Title */}
              <Text style={styles.chartTitle}>
                Referência de densitometria: {exame === 'Coluna Lombar' ? 'L1-L4' : exame}
              </Text>
              
              {/* Y-Axis Labels and Chart Area */}
              <View style={styles.chartWrapper}>
                {/* Y-Axis BMD Label */}
                <View style={styles.yAxisLabelContainer}>
                  <Text style={styles.yAxisLabelText}>BMD (g/cm²)</Text>
                </View>
                
                {/* Y-Axis BMD Values */}
                <View style={styles.yAxisLeft}>
                  <Text style={styles.yAxisValue}>1.443</Text>
                  <Text style={styles.yAxisValue}>1.319</Text>
                  <Text style={styles.yAxisValue}>1.195</Text>
                  <Text style={styles.yAxisValue}>1.071</Text>
                  <Text style={styles.yAxisValue}>0.947</Text>
                  <Text style={styles.yAxisValue}>0.823</Text>
                  <Text style={styles.yAxisValue}>0.699</Text>
                  <Text style={styles.yAxisValue}>0.575</Text>
                </View>

                {/* Main Chart */}
                <View style={styles.chartArea}>
                  {/* Normal Zone (Green) */}
                  <View style={[styles.chartZone, styles.normalZone, { height: '35%' }]}>
                    <Text style={styles.zoneLabel}>Normal</Text>
                  </View>
                  
                  {/* Osteopenia Zone (Yellow) */}
                  <View style={[styles.chartZone, styles.osteopeniaZone, { height: '35%' }]}>
                    <Text style={styles.zoneLabel}>Osteopenia</Text>
                  </View>
                  
                  {/* Osteoporosis Zone (Red) */}
                  <View style={[styles.chartZone, styles.osteoporosisZone, { height: '30%' }]}>
                    <Text style={styles.zoneLabel}>Osteoporose</Text>
                  </View>

                  {/* Patient Marker */}
                  {roiData && (
                    <View 
                      style={[
                        styles.patientMarker,
                        {
                          // Position based on T-Score: -1 is at 35%, -2.5 is at 70%
                          top: roiData.tScore >= -1 
                            ? `${Math.max(5, 35 - ((roiData.tScore + 1) * 15))}%`
                            : roiData.tScore >= -2.5 
                              ? `${35 + ((Math.abs(roiData.tScore) - 1) * (35 / 1.5))}%`
                              : `${70 + ((Math.abs(roiData.tScore) - 2.5) * 10)}%`,
                          // Position based on age
                          left: `${Math.min(90, Math.max(10, ((parseInt(idade) - 20) / 80) * 100))}%`,
                        }
                      ]}
                    >
                      <View style={styles.markerDot} />
                      <View style={styles.markerLine} />
                    </View>
                  )}
                </View>

                {/* Y-Axis T-Score Values */}
                <View style={styles.yAxisRight}>
                  <Text style={styles.yAxisValue}>+2</Text>
                  <Text style={styles.yAxisValue}>+1</Text>
                  <Text style={styles.yAxisValue}>0</Text>
                  <Text style={styles.yAxisValue}>-1</Text>
                  <Text style={styles.yAxisValue}>-2</Text>
                  <Text style={styles.yAxisValue}>-3</Text>
                  <Text style={styles.yAxisValue}>-4</Text>
                  <Text style={styles.yAxisValue}>-5</Text>
                </View>
                
                {/* Y-Axis T-Score Label */}
                <View style={styles.yAxisLabelContainer}>
                  <Text style={styles.yAxisLabelText}>T-Score</Text>
                </View>
              </View>

              {/* X-Axis */}
              <View style={styles.xAxis}>
                <Text style={styles.xAxisLabel}>Idade (anos)</Text>
                <View style={styles.xAxisValues}>
                  <Text style={styles.xAxisValue}>20</Text>
                  <Text style={styles.xAxisValue}>30</Text>
                  <Text style={styles.xAxisValue}>40</Text>
                  <Text style={styles.xAxisValue}>50</Text>
                  <Text style={styles.xAxisValue}>60</Text>
                  <Text style={styles.xAxisValue}>70</Text>
                  <Text style={styles.xAxisValue}>80</Text>
                  <Text style={styles.xAxisValue}>90</Text>
                  <Text style={styles.xAxisValue}>100</Text>
                </View>
              </View>

              {/* Patient Info on Chart */}
              {roiData && (
                <View style={styles.chartPatientInfo}>
                  <View style={styles.chartPatientRow}>
                    <View style={styles.chartPatientDot} />
                    <Text style={styles.chartPatientText}>
                      Paciente: {nome} ({idade} anos)
                    </Text>
                  </View>
                  <Text style={styles.chartPatientResult}>
                    BMD: {roiData.bmd?.toFixed(3)} g/cm² | T-Score: {roiData.tScore?.toFixed(1)} | 
                    <Text style={{ 
                      color: roiData.tScore >= -1 ? '#66BB6A' : roiData.tScore >= -2.5 ? '#FFCA28' : '#EF5350',
                      fontWeight: '700'
                    }}>
                      {' '}{roiData.tScore >= -1 ? 'Normal' : roiData.tScore >= -2.5 ? 'Osteopenia' : 'Osteoporose'}
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={gerarPDF}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="file-pdf" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Gerar PDF</Text>
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
}

const InfoRow = ({ icon, label, value, valueColor }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <FontAwesome5 name={icon} size={14} color="#4A90E2" />
    </View>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={[styles.infoValue, valueColor && { color: valueColor, fontWeight: '700' }]}>{value}</Text>
  </View>
);

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
  // Info Grid - 2x2 layout for patient data
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoGridItem: {
    width: '47%',
    backgroundColor: '#1a1d29',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6,
  },
  infoGridLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoGridValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Exam Info Row
  examInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  examInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d29',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  examInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  examInfoLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  examInfoValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  // Metrics Container - for DXA results
  metricsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1a1d29',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  // Diagnosis Badge
  diagnosisBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  diagnosisText: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Legacy styles (kept for compatibility)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3f52',
    marginVertical: 16,
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
    height: 200,
    borderRadius: 8,
  },
  // Scanner Image - Larger & Responsive
  scannerImageContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#000',
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 8,
  },
  scannerImage: {
    width: '100%',
    height: 350,
    borderRadius: 8,
    maxWidth: 500,
  },
  noImageContainer: {
    width: '100%',
    height: 250,
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
  },
  roiInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3a3f52',
  },
  roiInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 12,
  },
  roiMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  roiMetricBox: {
    flex: 1,
    backgroundColor: '#1a1d29',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roiMetricLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  roiMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roiMetricUnit: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  // Dynamic Chart Styles
  chartContainer: {
    padding: 16,
    backgroundColor: '#1a1d29',
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3f52',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 280,
    alignItems: 'stretch',
  },
  yAxisLabelContainer: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yAxisLabelText: {
    fontSize: 11,
    color: '#4A90E2',
    fontWeight: '700',
    transform: [{ rotate: '-90deg' }],
    width: 80,
    textAlign: 'center',
  },
  yAxisLeft: {
    width: 45,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 6,
    paddingVertical: 8,
  },
  yAxisRight: {
    width: 35,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingLeft: 6,
    paddingVertical: 8,
  },
  yAxisValue: {
    fontSize: 10,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
    backgroundColor: '#2a3142',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  chartZone: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  normalZone: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
    borderBottomWidth: 3,
    borderBottomColor: '#66BB6A',
  },
  osteopeniaZone: {
    backgroundColor: 'rgba(255, 193, 7, 0.5)',
    borderBottomWidth: 3,
    borderBottomColor: '#FFCA28',
  },
  osteoporosisZone: {
    backgroundColor: 'rgba(244, 67, 54, 0.5)',
  },
  zoneLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  patientMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  markerLine: {
    width: 3,
    height: 50,
    backgroundColor: '#4A90E2',
    opacity: 0.8,
    borderRadius: 2,
  },
  xAxis: {
    paddingTop: 12,
    alignItems: 'center',
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '700',
    marginBottom: 6,
  },
  xAxisValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 60,
  },
  xAxisValue: {
    fontSize: 10,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  chartPatientInfo: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#2a3142',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  chartPatientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  chartPatientDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A90E2',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chartPatientText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chartPatientResult: {
    fontSize: 13,
    color: '#CCCCCC',
    marginLeft: 22,
    lineHeight: 20,
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
