import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../src/context/ThemeContext';

export default function ResultadoScreen({ navigation, route }) {
  const { theme, isDarkMode } = useTheme();
  const paciente = route?.params?.paciente || {};
  
  // Simula resultados baseados na idade e sexo
  const gerarResultados = () => {
    const idade = parseInt(paciente.idade) || 50;
    const sexo = paciente.sexo || 'Feminino';
    
    let tScore, zScore, densidade, interpretacao, risco, cor;
    
    if (idade < 30) {
      tScore = Math.random() > 0.3 ? (Math.random() * 1.5 - 0.5) : (Math.random() * -1.5 - 1);
      densidade = 1.1 + Math.random() * 0.3;
    } else if (idade < 50) {
      tScore = Math.random() > 0.4 ? (Math.random() * 1 - 1) : (Math.random() * -2 - 1);
      densidade = 1.0 + Math.random() * 0.2;
    } else {
      tScore = Math.random() > 0.6 ? (Math.random() * -1.5 - 1) : (Math.random() * -3 - 2);
      densidade = 0.8 + Math.random() * 0.3;
    }
    
    zScore = tScore + (Math.random() * 0.5 - 0.25);
    
    if (tScore >= -1.0) {
      interpretacao = 'Normal';
      risco = 'Baixo';
      cor = '#10B981';
    } else if (tScore >= -2.5) {
      interpretacao = 'Osteopenia';
      risco = 'Moderado';
      cor = '#F59E0B';
    } else {
      interpretacao = 'Osteoporose';
      risco = 'Alto';
      cor = '#EF4444';
    }
    
    return {
      tScore: tScore.toFixed(1),
      zScore: zScore.toFixed(1),
      densidade: densidade.toFixed(3),
      interpretacao,
      risco,
      cor
    };
  };

  const resultados = gerarResultados();

  const getStatusIcon = () => {
    if (resultados.interpretacao === 'Normal') return '✅';
    if (resultados.interpretacao === 'Osteopenia') return '⚠️';
    return '❌';
  };

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
          : [theme.colors.success, theme.colors.successLight]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={[styles.backButton, { 
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
          }]}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { 
            color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' 
          }]}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={[styles.headerIconContainer, { 
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          }]}>
            <Text style={styles.headerIcon}>📊</Text>
          </View>
          <Text style={[styles.headerTitle, { 
            color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' 
          }]}>
            Resultados
          </Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card do Paciente */}
        <View style={[styles.patientCard, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          ...theme.shadows.lg,
        }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Dados do Paciente
          </Text>
          <View style={styles.patientInfo}>
            <InfoRow label="Nome" value={paciente.nome} theme={theme} />
            <InfoRow label="Idade" value={`${paciente.idade} anos`} theme={theme} />
            <InfoRow label="Sexo" value={paciente.sexo} theme={theme} />
            <InfoRow label="Exame" value={paciente.exame} theme={theme} />
            <InfoRow label="Data" value={new Date().toLocaleDateString('pt-BR')} theme={theme} />
          </View>
        </View>

        {/* Status Geral */}
        <View style={[styles.statusCard, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderLeftColor: resultados.cor,
          ...theme.shadows.lg,
        }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: `${resultados.cor}20` }]}>
              <Text style={styles.statusEmoji}>{getStatusIcon()}</Text>
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusText, { color: resultados.cor }]}>
                {resultados.interpretacao}
              </Text>
              <Text style={[styles.riskText, { color: theme.colors.textSecondary }]}>
                Risco: {resultados.risco}
              </Text>
            </View>
          </View>
        </View>

        {/* Resultados Detalhados */}
        <View style={[styles.resultsCard, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          ...theme.shadows.md,
        }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Valores Obtidos
          </Text>
          
          <ResultItem 
            label="Densidade Mineral Óssea"
            value={resultados.densidade}
            unit="g/cm²"
            theme={theme}
          />

          <ResultItem 
            label="T-Score"
            description="Comparação com adulto jovem"
            value={resultados.tScore}
            valueColor={resultados.cor}
            theme={theme}
          />

          <ResultItem 
            label="Z-Score"
            description="Comparação com mesma idade"
            value={resultados.zScore}
            theme={theme}
          />
        </View>

        {/* Interpretação */}
        <View style={[styles.interpretationCard, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          ...theme.shadows.md,
        }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Interpretação
          </Text>
          
          <View style={styles.scaleContainer}>
            <ScaleItem color="#10B981" text="Normal (T-score ≥ -1.0)" theme={theme} />
            <ScaleItem color="#F59E0B" text="Osteopenia (-2.5 < T-score < -1.0)" theme={theme} />
            <ScaleItem color="#EF4444" text="Osteoporose (T-score ≤ -2.5)" theme={theme} />
          </View>

          <View style={[styles.recommendationBox, { 
            backgroundColor: isDarkMode ? theme.colors.backgroundLight : '#F8FAFC',
            borderColor: theme.colors.border,
          }]}>
            <Text style={[styles.recommendationTitle, { color: theme.colors.text }]}>
              Recomendações:
            </Text>
            {resultados.interpretacao === 'Normal' && (
              <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
                • Manter atividade física regular{'\n'}
                • Dieta rica em cálcio e vitamina D{'\n'}
                • Controle periódico anual
              </Text>
            )}
            {resultados.interpretacao === 'Osteopenia' && (
              <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
                • Aumentar atividade física com peso{'\n'}
                • Suplementação de cálcio e vitamina D{'\n'}
                • Acompanhamento médico a cada 6 meses{'\n'}
                • Evitar fatores de risco para quedas
              </Text>
            )}
            {resultados.interpretacao === 'Osteoporose' && (
              <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
                • Tratamento medicamentoso indicado{'\n'}
                • Fisioterapia especializada{'\n'}
                • Prevenção rigorosa de quedas{'\n'}
                • Acompanhamento médico frequente
              </Text>
            )}
          </View>
        </View>

        {/* Gráfico de Referência */}
        <View style={[styles.chartCard, { 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          ...theme.shadows.md,
        }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Gráfico de Referência
          </Text>
          <View style={[styles.imageContainer, { borderColor: theme.colors.border }]}>
            <Image 
              source={require('../assets/grafico-tscore.jpg')} 
              style={styles.chartImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Ações */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { ...theme.shadows.md }]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionIcon}>💾</Text>
              <Text style={styles.actionText}>Baixar Relatório</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { ...theme.shadows.md }]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.secondary, theme.colors.secondaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionText}>Compartilhar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Componentes auxiliares
const InfoRow = ({ label, value, theme }) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
      {label}:
    </Text>
    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
      {value}
    </Text>
  </View>
);

const ResultItem = ({ label, description, value, unit, valueColor, theme }) => (
  <View style={styles.resultItem}>
    <View style={styles.resultHeader}>
      <View>
        <Text style={[styles.resultLabel, { color: theme.colors.text }]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.resultDescription, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {unit && (
        <Text style={[styles.resultUnit, { color: theme.colors.textSecondary }]}>
          {unit}
        </Text>
      )}
    </View>
    <Text style={[styles.resultValue, { color: valueColor || theme.colors.text }]}>
      {value}
    </Text>
  </View>
);

const ScaleItem = ({ color, text, theme }) => (
  <View style={styles.scaleItem}>
    <View style={[styles.scaleIndicator, { backgroundColor: color }]} />
    <Text style={[styles.scaleText, { color: theme.colors.textSecondary }]}>
      {text}
    </Text>
  </View>
);

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
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  patientInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusEmoji: {
    fontSize: 28,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  riskText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
  },
  resultItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultDescription: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  resultUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  interpretationCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
  },
  scaleContainer: {
    marginBottom: 20,
    gap: 8,
  },
  scaleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scaleIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  scaleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationBox: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  chartCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  chartImage: {
    width: '100%',
    height: 200,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  actionText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
