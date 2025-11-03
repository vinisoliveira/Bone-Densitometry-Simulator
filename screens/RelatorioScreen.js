import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Print } from 'expo-print';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faFileText,
  faUser,
  faCalendarAlt,
  faVenus,
  faMars,
  faBone,
  faFilePdf,
  faImage,
  faChartLine,
  faCrosshairs,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { theme } from '../src/styles/theme';
import BaseLayout from '../src/components/BaseLayout';
import Card from '../src/components/Card';

export default function RelatorioScreen({ route }) {
  const { paciente, idade, sexo, etnia, exame, vertebraSelecionada } = route.params;

  const gerarPDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .info-section { margin-bottom: 20px; }
              .info-row { margin-bottom: 10px; }
              .label { font-weight: bold; }
              .title { color: #2563EB; font-size: 24px; margin-bottom: 10px; }
              .subtitle { color: #10B981; font-size: 18px; margin: 20px 0 10px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">Relatório de Densitometria Óssea</h1>
              <p>Simulador de Bone Densitometry</p>
            </div>
            
            <div class="info-section">
              <h2 class="subtitle">Informações do Paciente</h2>
              <div class="info-row"><span class="label">Paciente:</span> ${paciente}</div>
              <div class="info-row"><span class="label">Idade:</span> ${idade} anos</div>
              <div class="info-row"><span class="label">Sexo:</span> ${sexo}</div>
              <div class="info-row"><span class="label">Etnia:</span> ${etnia}</div>
            </div>
            
            <div class="info-section">
              <h2 class="subtitle">Dados do Exame</h2>
              <div class="info-row"><span class="label">Tipo de Exame:</span> ${exame}</div>
              <div class="info-row"><span class="label">Região Selecionada:</span> ${vertebraSelecionada || 'Nenhuma'}</div>
              <div class="info-row"><span class="label">Data:</span> ${new Date().toLocaleDateString('pt-BR')}</div>
            </div>
            
            <div class="info-section">
              <h2 class="subtitle">Observações</h2>
              <p>Este é um relatório simulado gerado pelo Bone Densitometry Simulator.</p>
              <p>As imagens e valores apresentados são para fins educacionais.</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      Alert.alert('Sucesso', 'PDF gerado com sucesso!', [
        { text: 'OK', style: 'default' }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    }
  };

  const getSexIcon = () => {
    switch (sexo) {
      case 'Masculino':
        return faMars;
      case 'Feminino':
        return faVenus;
      default:
        return faUser;
    }
  };

  return (
    <BaseLayout 
      title="Relatório de Exame"
      headerIcon={faFileText}
      showBackButton
      navigation={route.navigation || { goBack: () => {} }}
    >
      {/* Informações do Paciente */}
      <Card style={styles.patientCard}>
        <View style={styles.cardHeader}>
          <FontAwesomeIcon icon={faUser} size={20} color={theme.colors.primary} />
          <Text style={styles.cardTitle}>Informações do Paciente</Text>
        </View>
        <View style={styles.patientInfo}>
          <View style={styles.infoRow}>
            <FontAwesomeIcon icon={faUser} size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoLabel}>Paciente:</Text>
            <Text style={styles.infoValue}>{paciente}</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesomeIcon icon={faCalendarAlt} size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoLabel}>Idade:</Text>
            <Text style={styles.infoValue}>{idade} anos</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesomeIcon icon={getSexIcon()} size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoLabel}>Sexo:</Text>
            <Text style={styles.infoValue}>{sexo}</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesomeIcon icon={faBone} size={14} color={theme.colors.accent} />
            <Text style={styles.infoLabel}>Exame:</Text>
            <Text style={styles.infoValue}>{exame}</Text>
          </View>
          {vertebraSelecionada && (
            <View style={styles.infoRow}>
              <FontAwesomeIcon icon={faCrosshairs} size={14} color={theme.colors.secondary} />
              <Text style={styles.infoLabel}>Região:</Text>
              <Text style={styles.infoValue}>{vertebraSelecionada}</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Imagens do Exame */}
      <Card style={styles.imageCard}>
        <View style={styles.cardHeader}>
          <FontAwesomeIcon icon={faImage} size={20} color={theme.colors.secondary} />
          <Text style={styles.cardTitle}>Imagem do Exame</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image source={require('../assets/coluna-lombar.jpeg')} style={styles.image} />
          <Text style={styles.imageCaption}>Scanner - {exame}</Text>
        </View>
      </Card>

      {/* Referência de Densitometria */}
      <Card style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <FontAwesomeIcon icon={faChartLine} size={20} color={theme.colors.accent} />
          <Text style={styles.cardTitle}>Referência de Densitometria</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image source={require('../assets/grafico-tscore.jpg')} style={styles.image} />
          <Text style={styles.imageCaption}>Gráfico T-Score</Text>
        </View>
      </Card>

      {/* Informações Técnicas */}
      <Card style={styles.techCard}>
        <View style={styles.cardHeader}>
          <FontAwesomeIcon icon={faFileText} size={20} color={theme.colors.info} />
          <Text style={styles.cardTitle}>Informações Técnicas</Text>
        </View>
        <View style={styles.techInfo}>
          <Text style={styles.techText}>• Data do Exame: {new Date().toLocaleDateString('pt-BR')}</Text>
          <Text style={styles.techText}>• Equipamento: Simulador de Densitometria</Text>
          <Text style={styles.techText}>• Método: DXA (Dual-energy X-ray absorptiometry)</Text>
          <Text style={styles.techText}>• Status: Simulação Educacional</Text>
        </View>
      </Card>

      {/* Botão PDF */}
      <TouchableOpacity style={styles.pdfButton} onPress={gerarPDF} activeOpacity={0.7}>
        <FontAwesomeIcon icon={faFilePdf} size={20} color="white" />
        <Text style={styles.pdfButtonText}>Gerar Relatório PDF</Text>
        <FontAwesomeIcon icon={faDownload} size={16} color="white" />
      </TouchableOpacity>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  patientCard: {
    marginBottom: theme.spacing.lg,
  },
  imageCard: {
    marginBottom: theme.spacing.lg,
  },
  chartCard: {
    marginBottom: theme.spacing.lg,
  },
  techCard: {
    marginBottom: theme.spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  patientInfo: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    minWidth: 60,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  imageCaption: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  techInfo: {
    gap: theme.spacing.sm,
  },
  techText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  pdfButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  pdfButtonText: {
    ...theme.typography.body,
    color: 'white',
    fontWeight: '600',
    marginHorizontal: theme.spacing.md,
  },
});
