import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { deletarPaciente, buscarImagemPorHash } from '../utils/storage';

const ExameDetalheScreen = ({ route, navigation }) => {
  const {
    id,
    nome,
    idade,
    sexo,
    etnia,
    exame,
    vertebraSelecionada,
    dataCriacao,
    imagemCustomizada,
    imagemHash,
  } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Imagem customizada vinda do paciente (URI ou data URL).
  // Fallback: tenta buscar pelo hash (caso a lista não tenha passado a URI).
  const [imagemUri, setImagemUri] = useState(imagemCustomizada || null);

  useEffect(() => {
    let active = true;
    if (!imagemUri && imagemHash) {
      buscarImagemPorHash(imagemHash).then((dados) => {
        if (active && dados?.uri) setImagemUri(dados.uri);
      });
    }
    return () => { active = false; };
  }, [imagemUri, imagemHash]);

  // Memoizar dados computados para evitar recálculos
  const dadosExame = useMemo(() => {
    const dataFormatada = dataCriacao
      ? new Date(dataCriacao).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Data não disponível';

    return { dataFormatada };
  }, [dataCriacao]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDelete = async () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o exame de ${nome}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Excluindo exame com ID:', id);
              
              // Deleta do AsyncStorage
              await deletarPaciente(id);
              
              console.log('Exame excluído com sucesso');
              
              // Limpa todo o histórico de navegação e vai direto para a Lista
              // Isso força a Lista a recarregar os dados
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
              
              // Depois navega para a lista (que já vai carregar sem o exame excluído)
              setTimeout(() => {
                navigation.navigate('Lista');
              }, 100);
              
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir o exame. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <FontAwesome5 name={icon} size={14} color="#4A90E2" />
      </View>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes do Exame</Text>
        <TouchableOpacity style={styles.deleteHeaderButton} onPress={handleDelete}>
          <FontAwesome5 name="trash-alt" size={20} color="#FF4444" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Patient Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="user-circle" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Informações do Paciente</Text>
            </View>
            <View style={styles.cardContent}>
              <InfoRow icon="user" label="Paciente" value={nome} />
              <InfoRow icon="birthday-cake" label="Idade" value={`${idade} anos`} />
              <InfoRow icon="venus-mars" label="Sexo" value={sexo} />
              <InfoRow icon="globe-americas" label="Etnia" value={etnia} />
            </View>
          </View>

          {/* Exam Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="x-ray" size={24} color="#4A90E2" />
              <Text style={styles.cardTitle}>Informações do Exame</Text>
            </View>
            <View style={styles.cardContent}>
              <InfoRow icon="file-medical-alt" label="Tipo de Exame" value={exame} />
              <InfoRow
                icon="map-marker-alt"
                label="Região"
                value={vertebraSelecionada || 'Não selecionada'}
              />
              <InfoRow icon="calendar" label="Data do Exame" value={dadosExame.dataFormatada} />
            </View>
          </View>

          {/* Exam Image */}
          {imagemUri && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="image" size={24} color="#4A90E2" />
                <Text style={styles.cardTitle}>Imagem do Exame</Text>
              </View>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: imagemUri }}
                  style={styles.image}
                  resizeMode="contain"
                  progressiveRenderingEnabled={true}
                  fadeDuration={200}
                />
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate('Relatorio', {
                id,
                nome,
                idade,
                sexo,
                etnia,
                exame,
                vertebraSelecionada,
              })
            }
            activeOpacity={0.8}
          >
            <FontAwesome5 name="file-alt" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Ver Relatório</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.navigate('Lista')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="list" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Ver Lista de Exames</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a3142',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#2a3142',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3f52',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
    minWidth: 110,
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  imageContainer: {
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: '#667eea',
  },
  buttonDanger: {
    backgroundColor: '#FF4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ExameDetalheScreen;
