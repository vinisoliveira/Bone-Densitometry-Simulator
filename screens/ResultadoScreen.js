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

const { width, height } = Dimensions.get('window');

export default function ResultadoScreen({ route }) {
  const { paciente, idade, sexo, etnia, exame } = route.params;
  const [selectedId, setSelectedId] = useState(null);

  // Usando a imagem enviada
  const imagemColuna = require('../assets/coluna-lombar.jpeg');

  // Retângulos interativos para L1 a L4
  const vertebras = [
    { id: 'L1', x: 110, y: 30, width: 125, height: 70 },
    { id: 'L2', x: 110, y: 105, width: 125, height: 70 },
    { id: 'L3', x: 110, y: 185, width: 125, height: 70 },
    { id: 'L4', x: 110, y: 260, width: 125, height: 70 },
  ];

  const selected = vertebras.find(v => v.id === selectedId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultado: {exame}</Text>

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
                borderColor: '#00ffff',
              }}
              onPress={() => setSelectedId(v.id)}
            />
          ))}
        </View>
      </ImageZoom>

      <View style={styles.laudoBox}>
        <Text style={styles.laudoTitle}>Laudo Técnico</Text>
        <Text style={styles.laudoText}>
          Retificação da lordose lombar fisiológica. Sem fraturas ou lesões agudas. Estruturas articulares preservadas.
        </Text>
        {selected && (
          <Text style={styles.laudoText}>
            Vértebra selecionada: {selected.id}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#0a1f44' },
  infoBox: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    width: '90%',
  },
  infoText: { fontSize: 16, color: '#333', marginBottom: 5 },
  imageWrapper: { width: width * 0.8, height: height * 0.5 },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  laudoBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    width: '90%',
  },
  laudoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#0a1f44' },
  laudoText: { fontSize: 16, lineHeight: 22, color: '#333' },
});
