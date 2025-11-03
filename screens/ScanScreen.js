import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, ScrollView } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ScanScreen({ navigation, route }) {
  const { theme, isDarkMode } = useTheme();
  const paciente = route?.params;
  const [scanning, setScanning] = useState(false);

  const handleGoBack = () => {
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    } else if (Platform.OS === 'web' && window.history) {
      window.history.back();
    }
  };

  const handleStartScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      if (Platform.OS === 'web') {
        alert('✅ Escaneamento concluído! Análise disponível em breve.');
      }
    }, 3000);
  };

  const exameDetails = [
    { label: 'Tipo de Exame', value: paciente?.exame || 'N/A', icon: '🦴' },
    { label: 'Etnia', value: paciente?.etnia || 'N/A', icon: '👤' },
    { label: 'Data', value: paciente?.dataExame || 'N/A', icon: '📅' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      {/* Header */}
      <LinearGradient
        colors={isDarkMode 
          ? [theme.colors.backgroundLight, theme.colors.surface] 
          : [theme.colors.accent, theme.colors.accentLight]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={[styles.backButton, { 
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
          }]}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { 
            color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' 
          }]}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={[styles.headerIconContainer, { 
            backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          }]}>
            <Text style={styles.headerIcon}>🔬</Text>
          </View>
          <Text style={[styles.headerTitle, { 
            color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' 
          }]}>
            Análise
          </Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Informações do Paciente */}
        {paciente && (
          <View style={[styles.patientCard, { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            ...theme.shadows.md,
          }]}>
            <LinearGradient
              colors={[theme.colors.primary + '15', 'transparent']}
              style={styles.patientGradient}
            />
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.patientAvatar}
            >
              <Text style={styles.patientAvatarText}>
                {paciente.nome.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.patientInfo}>
              <Text style={[styles.patientName, { color: theme.colors.text }]}>
                {paciente.nome}
              </Text>
              <View style={styles.patientTags}>
                <Text style={[styles.patientTag, { 
                  backgroundColor: theme.colors.info + '20',
                  color: theme.colors.info,
                }]}>
                  {paciente.idade} anos
                </Text>
                <Text style={[styles.patientTag, { 
                  backgroundColor: theme.colors.secondary + '20',
                  color: theme.colors.secondary,
                }]}>
                  {paciente.sexo}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Detalhes do Exame */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            DETALHES DO EXAME
          </Text>
          {exameDetails.map((detail, index) => (
            <View
              key={index}
              style={[styles.detailCard, { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                ...theme.shadows.sm,
              }]}
            >
              <View style={[styles.detailIcon, { 
                backgroundColor: theme.colors.surfaceLight 
              }]}>
                <Text style={styles.detailEmoji}>{detail.icon}</Text>
              </View>
              <View style={styles.detailInfo}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  {detail.label}
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {detail.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Scanner Visual */}
        <View style={[styles.scannerContainer, { 
          backgroundColor: theme.colors.card,
          borderColor: scanning ? theme.colors.primary : theme.colors.border,
          ...theme.shadows.lg,
        }]}>
          <LinearGradient
            colors={scanning 
              ? [theme.colors.primary + '20', theme.colors.accent + '20'] 
              : [theme.colors.surfaceLight, theme.colors.surface]}
            style={styles.scannerGradient}
          >
            <Text style={styles.scannerIcon}>{scanning ? '⚡' : '🩻'}</Text>
            <Text style={[styles.scannerText, { color: theme.colors.text }]}>
              {scanning ? 'Analisando...' : 'Pronto para Análise'}
            </Text>
            {scanning && (
              <View style={styles.scannerBar}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.scannerBarFill}
                />
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Botão de Iniciar */}
        {!scanning && (
          <TouchableOpacity
            style={[styles.scanButton, { 
              backgroundColor: theme.colors.primary,
              ...theme.shadows.lg,
            }]}
            onPress={handleStartScan}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanButtonGradient}
            >
              <Text style={styles.scanButtonIcon}>▶️</Text>
              <Text style={styles.scanButtonText}>Iniciar Análise</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Informação */}
        <View style={[styles.infoBox, { 
          backgroundColor: theme.colors.warning + '15',
          borderColor: theme.colors.warning + '30',
        }]}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            A análise simulará o processo de densitometria óssea com resultados educacionais
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -44,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  patientCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  patientAvatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  patientAvatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  patientTags: {
    flexDirection: 'row',
    gap: 8,
  },
  patientTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailEmoji: {
    fontSize: 24,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  scannerContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
  },
  scannerGradient: {
    padding: 32,
    alignItems: 'center',
  },
  scannerIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  scannerText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  scannerBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scannerBarFill: {
    height: '100%',
    width: '100%',
  },
  scanButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  scanButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  infoBox: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
