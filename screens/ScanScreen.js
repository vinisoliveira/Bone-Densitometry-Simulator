import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function ScanScreen({ route }) {
  const navigation = useNavigation();
  const scanAnim = useRef(new Animated.Value(height)).current;

  const { paciente, idade, sexo, etnia, exame } = route.params;

  // Mapeia o exame para a imagem correspondente
  const imagemExame = {
    'Coluna Lombar': require('../assets/coluna-lombar.jpeg'),
    'Fêmur': require('../assets/femur.jpeg'),
    'Punho': require('../assets/punho.jpg'),
  };

  useEffect(() => {
    Animated.timing(scanAnim, {
      toValue: 0,
      duration: 4000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace('Resultado', {
        paciente,
        idade,
        sexo,
        etnia,
        exame,
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <MaskedView
        style={styles.maskedView}
        maskElement={
          <Animated.View
            style={[
              styles.mask,
              {
                transform: [{ translateY: scanAnim }],
              },
            ]}
          />
        }
      >
        <Image
          source={imagemExame[exame]}
          style={styles.image}
        />
      </MaskedView>

      <Text style={styles.text}>Escaneando {exame}...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskedView: {
    width: '80%',
    height: '80%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  mask: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  text: {
    position: 'absolute',
    bottom: 40,
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
