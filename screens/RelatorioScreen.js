import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Print } from 'expo-print';
import { colors, spacing, typography } from '../src/styles/theme';

export default function RelatorioScreen({ route }) {
  const { paciente, idade, sexo, etnia, exame, vertebraSelecionada } = route.params;

  const gerarPDF = async () => {
    const html = `
      <html>
        <body>
          <h1>Relatório de Exame</h1>
          <p><strong>Paciente:</strong> ${paciente}</p>
          <p><strong>Idade:</strong> ${idade}</p>
          <p><strong>Sexo:</strong> ${sexo}</p>
          <p><strong>Etnia:</strong> ${etnia}</p>
          <p><strong>Exame:</strong> ${exame}</p>
          <p><strong>Vértebra Selecionada:</strong> ${vertebraSelecionada || 'Nenhuma'}</p>
          <p><em>Imagens não incluídas nesta versão do PDF.</em></p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    alert('PDF gerado com sucesso: ' + uri);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Relatório de Exame</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Paciente: {paciente}</Text>
        <Text style={styles.infoText}>Idade: {idade}</Text>
        <Text style={styles.infoText}>Sexo: {sexo}</Text>
        <Text style={styles.infoText}>Etnia: {etnia}</Text>
        <Text style={styles.infoText}>Exame: {exame}</Text>
        <Text style={styles.infoText}>Vértebra Selecionada: {vertebraSelecionada || 'Nenhuma'}</Text>
      </View>

      <Text style={styles.subtitle}>Scanner</Text>
      <Image source={require('../assets/coluna-lombar.jpeg')} style={styles.image} />

      <Text style={styles.subtitle}>Referência de Densitometria</Text>
      <Image source={require('../assets/grafico-tscore.jpg')} style={styles.image} />

      <TouchableOpacity style={styles.button} onPress={gerarPDF}>
        <Text style={typography.buttonText}>📄 Gerar PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    ...typography.title,
    fontSize: 22,
    marginBottom: spacing.lg,
    color: colors.dark,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  infoBox: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: '90%',
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  image: {
    width: '90%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
    width: '90%',
  },
});
