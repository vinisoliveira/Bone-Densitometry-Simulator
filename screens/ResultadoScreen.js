import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { colors, spacing, typography } from '../src/styles/theme';
import { useNavigation } from '@react-navigation/native';
import { salvarPaciente } from '../utils/storage';

const { width, height } = Dimensions.get('window');

export default function ResultadoScreen({ route }) {
  const { paciente, idade, sexo, etnia, exame } = route.params;
  const [selectedId, setSelectedId] = useState(null);
  const navigation = useNavigation();

  // Imagens por exame
  const imagemExame = {
    'Coluna Lombar': require('../assets/coluna-lombar.jpeg'),
    'Fêmur': require('../assets/femur.jpeg'),
    'Punho': require('../assets/punho.jpg'),
  };

  // Regiões interativas por exame
  const regioesPorExame = {
    'Coluna Lombar': [
      { id: 'L1', x: 110, y: 30, width: 125, height: 70 },
      { id: 'L2', x: 110, y: 105, width: 125, height: 70 },
      { id: 'L3', x: 110, y: 185, width: 125, height: 70 },
      { id: 'L4', x: 110, y: 260, width: 125, height: 70 },
    ],
    'Fêmur': [
      { id: 'Cabeça Femoral', x: 100, y: 40, width: 140, height: 80 },
      { id: 'Diáfise', x: 100, y: 150, width: 140, height: 100 },
    ],
    'Punho': [
      { id: 'Rádio', x: 90, y: 60, width: 160, height: 80 },
      { id: 'Ulna', x: 90, y: 160, width: 160, height: 80 },
    ],
  };

  const regioes = regioesPorExame[exame] || [];
  const regiaoSelecionada = regioes.find((r) => r.id === selectedId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GLOBAL ROI {exame}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Paciente: {paciente}</Text>
        <Text style={styles.infoText}>Idade: {idade}</Text>
        <Text style={styles.infoText}>Sexo: {sexo}</Text>
        <Text style={styles.infoText}>Etnia: {etnia}</Text>
      </View>

      <ImageZoom
        cropWidth={width}
        cropHeight={height * 0.5}
        imageWidth={width * 0.8}
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
                borderWidth: selectedId === r.id ? 2 : 0,
                borderColor: 'yellow',
              }}
              onPress={() => setSelectedId(r.id)}
            />
          ))}

          {regiaoSelecionada && (
            <Text
              style={{
                position: 'absolute',
                left: regiaoSelecionada.x,
                top: regiaoSelecionada.y + 2,
                color: 'yellow',
                fontWeight: 'bold',
                fontSize: 16,
                paddingHorizontal: 4,
              }}
            >
              {regiaoSelecionada.id}
            </Text>
          )}
        </View>
      </ImageZoom>

      <View style={styles.divider} />

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            salvarPaciente({
              id: Date.now().toString(),
              nome: paciente,
              exame,
            });

            navigation.navigate('Relatorio', {
              paciente,
              idade,
              sexo,
              etnia,
              exame,
              vertebraSelecionada: selectedId,
            });
          }}
        >
          <Text style={typography.buttonText}>Salvar Exame</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={() =>
            navigation.navigate('Relatorio', {
              paciente,
              idade,
              sexo,
              etnia,
              exame,
              vertebraSelecionada: selectedId,
            })
          }
        >
          <Text style={typography.buttonText}>📝 Ver Relatório</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.title,
    fontSize: 22,
    marginBottom: spacing.lg,
    color: colors.dark,
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
  imageWrapper: {
    width: width * 0.8,
    height: height * 0.5,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  divider: {
    height: 1,
    width: '90%',
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  controls: {
    width: '90%',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
