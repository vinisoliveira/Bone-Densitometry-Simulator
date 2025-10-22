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
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

export default function ResultadoScreen({ route }) {
  const { paciente, idade, sexo, etnia, exame } = route.params;
  const [selectedId, setSelectedId] = useState(null);
  const [contrast, setContrast] = useState(1); // 0.5 (baixo) a 1.5 (alto)

  const imagemColuna = require('../assets/coluna-lombar.jpeg');

  const vertebras = [
    { id: 'L1', x: 110, y: 30, width: 125, height: 70 },
    { id: 'L2', x: 110, y: 105, width: 125, height: 70 },
    { id: 'L3', x: 114, y: 185, width: 120, height: 70 },
    { id: 'L4', x: 110, y: 260, width: 125, height: 70 },
  ];

  const selected = vertebras.find(v => v.id === selectedId);

  const overlayOpacity = contrast < 1 ? 1 - contrast : 0;
  const imageStyle = {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    
  };

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
          <Image source={imagemColuna} style={imageStyle} />
          <View
            style={{
              position: 'absolute',
              left: 40,
              top: 0,
              width: '76%',
              height: '100%',
              backgroundColor: '#000000ff',
              opacity: overlayOpacity,
            }}
          />
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

      <View style={styles.sliderBox}>
        <Text style={styles.label}>Contraste: {contrast.toFixed(2)}</Text>
        <Slider
          minimumValue={0.5}
          maximumValue={1.5}
          value={contrast}
          onValueChange={setContrast}
          minimumTrackTintColor="#00ffff"
          maximumTrackTintColor="#ccc"
        />
      </View>

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
  imageWrapper: {
    width: width * 0.8,
    height: height * 0.5,
    position: 'relative',
    overflow: 'hidden',
  },
  sliderBox: {
    width: '90%',
    marginTop: 10,
    marginBottom: 20,
  },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  laudoBox: {
    padding: 15,
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    width: '90%',
  },
  laudoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#0a1f44' },
  laudoText: { fontSize: 16, lineHeight: 22, color: '#333' },
});
