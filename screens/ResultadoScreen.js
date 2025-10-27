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


const { width, height } = Dimensions.get('window');

export default function ResultadoScreen({ route }) {
  const { paciente, idade, sexo, etnia, exame } = route.params;
  const [selectedId, setSelectedId] = useState(null);

  const imagemColuna = require('../assets/coluna-lombar.jpeg');

  const navigation = useNavigation();

  const vertebras = [
    { id: 'L1', x: 110, y: 30, width: 125, height: 70 },
    { id: 'L2', x: 110, y: 105, width: 125, height: 70 },
    { id: 'L3', x: 110, y: 185, width: 125, height: 70 },
    { id: 'L4', x: 110, y: 260, width: 125, height: 70 },
  ];

  const vertebraSelecionada = vertebras.find((v) => v.id === selectedId);

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
          <Image source={imagemColuna} style={styles.image} />
          {vertebras.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={{
                position: 'absolute',
                left: v.x,
                top: v.y,
                width: v.width,
                height: v.height,
                borderWidth: selectedId === v.id ? 2 : 0,
                borderColor: "yellow",
              }}
              onPress={() => setSelectedId(v.id)}
            />
          ))}

          {vertebraSelecionada && (
            <Text
              style={{
                position: 'absolute',
                left: vertebraSelecionada.x,
                top: vertebraSelecionada.y + 1,
                color: "yellow",
                fontWeight: 'bold',
                fontSize: 16,
                paddingHorizontal: 4,
              }}
            >
              {vertebraSelecionada.id}
            </Text>
          )}
        </View>
      </ImageZoom>

      <View style={styles.divider} />

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button}>
          <Text style={typography.buttonText}>Aplicar Ajustes</Text>
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
