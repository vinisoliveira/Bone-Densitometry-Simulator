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

const { height, width } = Dimensions.get('window');

export default function ScanScreen({ route }) {
  const navigation = useNavigation();
  const scanAnim = useRef(new Animated.Value(height)).current;

  const { paciente, idade, sexo, etnia, exame } = route.params;

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
    }, 4000);

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
          source={require('../assets/coluna-lombar.jpeg')}
          style={styles.image}
        />
      </MaskedView>

      <Animated.View
        style={[
          styles.scanLine,
          { transform: [{ translateY: scanAnim }] },
        ]}
      />

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
  scanLine: {
    position: 'absolute',
    width: '80%',
    height: 4,
    backgroundColor: '#00ffff',
    borderRadius: 2,
    zIndex: 10,
  },
  text: {
    position: 'absolute',
    bottom: 40,
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
