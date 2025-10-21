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
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function ResultadoScreen({ route }) {
  const { paciente, idade, sexo, etnia, exame } = route.params;
  const [selectedId, setSelectedId] = useState(null);

  // Mapeamento de imagens e laudos
  const imagens = {
    'Coluna Lombar': require('../assets/coluna-lombar.png'),
    'Raio-X Torácico': require('../assets/torax.png'),
    'Tomografia Cervical': require('../assets/cervical.png'),
  };

  const laudos = {
    'Coluna Lombar':
      'Retificação da lordose lombar fisiológica. Sem fraturas ou lesões agudas. Estruturas articulares preservadas.',
    'Raio-X Torácico':
      'Campos pulmonares sem alterações. Silhueta cardíaca dentro dos limites. Sem derrame pleural.',
    'Tomografia Cervical':
      'Alinhamento vertebral preservado. Discretas alterações degenerativas em C5-C6. Sem compressão medular.',
  };

  // Pontos interativos (exemplo para coluna lombar)
  const pontos = exame === 'Coluna Lombar'
    ? [
        { id: 'L1', x: 150, y: 100 },
        { id: 'L2', x: 150, y: 140 },
        { id: 'L3', x: 150, y: 180 },
        { id: 'L4', x: 150, y: 220 },
        { id: 'L5', x: 150, y: 260 },
      ]
    : [];

  const selected = pontos.find(p => p.id === selectedId);

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
          <Image
            source={imagens[exame]}
            style={styles.image}
          />
          <Svg style={StyleSheet.absoluteFill}>
            {selected && (
              <Circle
                cx={selected.x}
                cy={selected.y}
                r="20"
                stroke="#00ffff"
                strokeWidth="3"
                fill="transparent"
              />
            )}
          </Svg>
          {pontos.map((ponto) => (
            <TouchableOpacity
              key={ponto.id}
              style={{
                position: 'absolute',
                left: ponto.x - 20,
                top: ponto.y - 20,
                width: 40,
                height: 40,
              }}
              onPress={() => setSelectedId(ponto.id)}
            />
          ))}
        </View>
      </ImageZoom>

      <View style={styles.laudoBox}>
        <Text style={styles.laudoTitle}>Laudo Técnico</Text>
        <Text style={styles.laudoText}>{laudos[exame]}</Text>
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
