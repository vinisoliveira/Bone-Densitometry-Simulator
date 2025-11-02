import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { carregarPacientes } from '../utils/storage';
import { colors, spacing, typography } from '../src/styles/theme';

export default function ListaScreen({ navigation }) {
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const lista = await carregarPacientes();
      setPacientes(lista);
    };
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Resultado', { paciente: item.nome, exame: item.exame })}
    >
      <Text style={styles.nome}>{item.nome}</Text>
      <Text style={styles.exame}>{item.exame}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exames</Text>
      <FlatList
        data={pacientes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 22,
    marginBottom: spacing.lg,
    color: colors.primary,
    textAlign: 'center',
  },
  list: {
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    elevation: 2,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  exame: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
});
