import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated, Easing, Image, Modal, Dimensions, useWindowDimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../src/contexts/ThemeContext';
import { useCustomAlert } from '../src/hooks/useCustomAlert';
import CustomAlert from '../src/components/CustomAlert';
import { salvarImagemExame } from '../utils/storage';

// Utilitários de formatação (locais, evitam crashes em runtime)
const formatarData = (texto) => {
  const numeros = (texto || '').replace(/\D/g, '').slice(0, 8);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
};

const dataParaString = (d) => {
  if (!d) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// Peso em kg com 1 casa decimal: usuário digita apenas dígitos e a vírgula
// é inserida automaticamente antes do último dígito. Ex: '705' -> '70,5'.
const formatarPeso = (texto) => {
  const digitos = (texto || '').replace(/\D/g, '').slice(0, 4);
  if (digitos.length === 0) return '';
  if (digitos.length === 1) return `0,${digitos}`;
  const inteiros = digitos.slice(0, -1).replace(/^0+(?=\d)/, '');
  const decimal = digitos.slice(-1);
  return `${inteiros || '0'},${decimal}`;
};

// Altura em metros com 2 casas decimais: '180' -> '1,80'. Ignora o primeiro
// dígito se não for 1 ou 2 para evitar valores absurdos.
const formatarAltura = (texto) => {
  const digitos = (texto || '').replace(/\D/g, '').slice(0, 3);
  if (digitos.length === 0) return '';
  if (digitos.length === 1) return digitos;
  if (digitos.length === 2) return `${digitos[0]},${digitos[1]}`;
  return `${digitos[0]},${digitos.slice(1)}`;
};

export default function CadastroScreen({ navigation }) {
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 400;
  const calendarWidth = Math.min(windowWidth * 0.92, 400);
  const daySize = (calendarWidth - 40) / 7; // 40 = padding total
  
  const { alertConfig, showAlert, hideAlert } = useCustomAlert();
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  
  const [paciente, setPaciente] = useState('');
  const [idade, setIdade] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [sexo, setSexo] = useState('');
  const [etnia, setEtnia] = useState('');
  const [exame, setExame] = useState('');
  const [operador, setOperador] = useState('');
  const [imagemExame, setImagemExame] = useState(null);
  const [imagemHash, setImagemHash] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date(2000, 0, 1));
  const [calendarMonth, setCalendarMonth] = useState(0);
  const [calendarYear, setCalendarYear] = useState(2000);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Handler para data de nascimento com máscara (fallback para digitação manual)
  const handleDataNascimento = (texto) => {
    const dataFormatada = formatarData(texto);
    setDataNascimento(dataFormatada);
  };

  // Abrir calendário customizado
  const abrirCalendario = () => {
    // Se já tem data selecionada, abrir no mês/ano correspondente
    if (dataNascimento && dataNascimento.length === 10) {
      const [dia, mes, ano] = dataNascimento.split('/').map(Number);
      setCalendarMonth(mes - 1);
      setCalendarYear(ano);
    }
    setShowDatePicker(true);
  };

  // Selecionar dia no calendário
  const selecionarDia = (dia) => {
    const novaData = new Date(calendarYear, calendarMonth, dia);
    setDataSelecionada(novaData);
    setDataNascimento(dataParaString(novaData));
    setShowDatePicker(false);
    
    // Calcular idade automaticamente
    const hoje = new Date();
    let idadeCalculada = hoje.getFullYear() - novaData.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNasc = novaData.getMonth();
    if (mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < novaData.getDate())) {
      idadeCalculada--;
    }
    if (idadeCalculada >= 0 && idadeCalculada < 150) {
      setIdade(String(idadeCalculada));
    }
  };

  // Navegação do calendário
  const mesAnterior = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const proximoMes = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  // Gerar dias do mês
  const gerarDiasDoMes = () => {
    const primeiroDia = new Date(calendarYear, calendarMonth, 1).getDay();
    const diasNoMes = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const dias = [];
    
    // Dias vazios antes do primeiro dia
    for (let i = 0; i < primeiroDia; i++) {
      dias.push(null);
    }
    
    // Dias do mês
    for (let i = 1; i <= diasNoMes; i++) {
      dias.push(i);
    }
    
    return dias;
  };

  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Handler para mudança de data no DatePicker
  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDataSelecionada(selectedDate);
      setDataNascimento(dataParaString(selectedDate));
      
      // Calcular idade automaticamente
      const hoje = new Date();
      let idadeCalculada = hoje.getFullYear() - selectedDate.getFullYear();
      const mesAtual = hoje.getMonth();
      const mesNascimento = selectedDate.getMonth();
      if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < selectedDate.getDate())) {
        idadeCalculada--;
      }
      if (idadeCalculada >= 0 && idadeCalculada < 150) {
        setIdade(String(idadeCalculada));
      }
    }
  };

  // Animações
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const particleAnimations = useRef([...Array(8)].map(() => ({
    translateY: new Animated.Value(0),
    translateX: new Animated.Value(0),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(1),
  }))).current;

  const validarCampos = () => {
    if (!paciente || !idade || !sexo || !etnia || !exame || !peso || !altura || !imagemExame) {
      showAlert({
        title: 'Atenção',
        message: 'Preencha todos os campos obrigatórios, selecione o tipo de exame e adicione uma imagem.',
        type: 'warning',
        buttons: [{ text: 'OK' }],
      });
      return false;
    }
    return true;
  };

  // Função para selecionar imagem ao clicar no tipo de exame
  const selecionarExameComImagem = async (tipoExame) => {
    try {
      // Pedir permissão para acessar a galeria
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showAlert({
          title: 'Permissão Negada',
          message: 'Precisamos de permissão para acessar suas fotos.',
          type: 'error',
          buttons: [{ text: 'OK' }],
        });
        return;
      }

      // Abrir seletor de imagem (API compatível Android/iOS/Web)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: Platform.OS !== 'web', // edição não suportada no web
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      
      // Convert to base64 data URI for persistence across sessions and platforms
      let persistentUri = uri;
      try {
        if (Platform.OS === 'web') {
          const response = await fetch(uri);
          const blob = await response.blob();
          persistentUri = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else if (FileSystem && typeof FileSystem.readAsStringAsync === 'function') {
          const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          const mimeType = uri.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
          persistentUri = `data:${mimeType};base64,${base64}`;
        }
      } catch (convErr) {
        if (__DEV__) console.warn('Could not convert to base64, using original URI:', convErr);
      }
      
      // Salvar imagem no storage com hash
      const dadosImagem = await salvarImagemExame(persistentUri, tipoExame);
      
      if (dadosImagem) {
        setExame(tipoExame);
        setImagemExame(persistentUri);
        setImagemHash(dadosImagem.hash);
      } else {
        showAlert({
          title: 'Erro',
          message: 'Não foi possível salvar a imagem. Tente novamente.',
          type: 'error',
          buttons: [{ text: 'OK' }],
        });
      }
    }
    } catch (err) {
      if (__DEV__) console.warn('Erro ao selecionar imagem:', err);
      showAlert({
        title: 'Erro',
        message: 'Não foi possível abrir a galeria. Tente novamente.',
        type: 'error',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  // Função para remover a imagem e desbloquear tipos de exame
  const removerImagem = () => {
    setExame('');
    setImagemExame(null);
    setImagemHash(null);
  };

  const animarSucesso = () => {
    setShowSuccessAnimation(true);

    // Animação do círculo de sucesso
    Animated.sequence([
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação das partículas
    particleAnimations.forEach((particle, index) => {
      const angle = (index / 8) * Math.PI * 2;
      const distance = 100;
      
      Animated.parallel([
        Animated.timing(particle.translateX, {
          toValue: Math.cos(angle) * distance,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: Math.sin(angle) * distance,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const resetarAnimacoes = () => {
    successScale.setValue(0);
    successOpacity.setValue(0);
    checkmarkScale.setValue(0);
    particleAnimations.forEach(particle => {
      particle.translateX.setValue(0);
      particle.translateY.setValue(0);
      particle.opacity.setValue(1);
      particle.scale.setValue(1);
    });
  };

  const iniciarEscaneamento = async () => {
    if (!validarCampos()) return;

    // Gerar ID único usando timestamp + random
    // Formato: timestamp-random-random
    // Exemplo: 1699123456789-a3b2c1-d4e5f6
    const timestamp = Date.now();
    const random1 = Math.random().toString(36).substring(2, 8);
    const random2 = Math.random().toString(36).substring(2, 8);
    const idUnico = `${timestamp}-${random1}-${random2}`;

    console.log('✅ ID único gerado:', idUnico);

    // NÃO salva ainda - apenas passa os dados para as próximas telas
    const dadosPaciente = {
      id: idUnico,
      nome: paciente,
      idade,
      dataNascimento,
      peso,
      altura,
      sexo,
      etnia,
      exame,
      operador: operador || 'Não informado',
      imagemCustomizada: imagemExame,
      imagemHash: imagemHash,
    };

    // Mostrar animação de sucesso
    animarSucesso();

    // Navegar após a animação - PASSA TODOS OS DADOS
    setTimeout(() => {
      resetarAnimacoes();
      setShowSuccessAnimation(false);
      navigation.navigate('Scan', dadosPaciente);
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.surface }]}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Novo Exame</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.formCard, { backgroundColor: theme.surface }]}>
            {/* Seção: Dados Pessoais */}
            <View style={styles.formSectionTitle}>
              <FontAwesome5 name="user-circle" size={16} color="#4A90E2" />
              <Text style={[styles.formSectionTitleText, { borderBottomColor: theme.border }]}>Dados Pessoais</Text>
            </View>

            <View style={[styles.inputGroup, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.inputIcon}>
                <FontAwesome5 name="user" size={16} color="#4A90E2" />
              </View>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Nome do paciente *"
                placeholderTextColor={theme.textMuted}
                value={paciente}
                onChangeText={setPaciente}
              />
            </View>

            <View style={styles.inputRow}>
              {/* Data de Nascimento primeiro */}
              <TouchableOpacity 
                style={[styles.inputGroup, styles.inputHalf, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={abrirCalendario}
                activeOpacity={0.7}
              >
                <View style={styles.inputIcon}>
                  <FontAwesome5 name="calendar-alt" size={16} color="#4A90E2" />
                </View>
                <Text style={[styles.datePickerText, { color: theme.text }, !dataNascimento && { color: theme.textMuted }]}>
                  {dataNascimento || 'Data Nasc. *'}
                </Text>
              </TouchableOpacity>

              {/* Idade depois */}
              <View style={[styles.inputGroup, styles.inputHalf, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <View style={styles.inputIcon}>
                  <FontAwesome5 name="birthday-cake" size={16} color="#4A90E2" />
                </View>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Idade *"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={idade}
                  onChangeText={setIdade}
                />
              </View>
            </View>

            {/* Calendário Customizado Modal */}
            {showDatePicker && (
              <Modal
                transparent={true}
                animationType="fade"
                visible={showDatePicker}
                onRequestClose={() => setShowDatePicker(false)}
              >
                <View style={styles.calendarOverlay}>
                  <View 
                    style={[styles.calendarContainer, { width: calendarWidth, backgroundColor: theme.surface, borderColor: theme.border }]} 
                  >
                    {/* Header do Calendário */}
                    <View style={[styles.calendarHeader, { borderBottomColor: theme.border }]}>
                      <Text style={[styles.calendarTitle, { color: theme.text }, isSmallScreen && { fontSize: 14 }]}>Data de Nascimento</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <FontAwesome5 name="times" size={isSmallScreen ? 16 : 18} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>

                    {/* Navegação Mês/Ano */}
                    <View style={[styles.calendarNav, { zIndex: 100 }]}>
                      <TouchableOpacity onPress={mesAnterior} style={[styles.calendarNavButton, isSmallScreen && { width: 28, height: 28 }]}>
                        <FontAwesome5 name="chevron-left" size={isSmallScreen ? 10 : 12} color="#4A90E2" />
                      </TouchableOpacity>
                      
                      <View style={[styles.calendarMonthYear, { zIndex: 100 }]}>
                        {/* Seletor de Mês */}
                        <View style={{ position: 'relative', zIndex: 101 }}>
                          <TouchableOpacity 
                            style={[styles.calendarMonthSelector, { backgroundColor: theme.background, borderColor: theme.border }]}
                            onPress={() => {
                              setShowMonthPicker(!showMonthPicker);
                              setShowYearPicker(false);
                            }}
                          >
                            <Text style={[styles.calendarMonthText, isSmallScreen && { fontSize: 13 }]}>
                              {nomesMeses[calendarMonth]}
                            </Text>
                            <FontAwesome5 name="caret-down" size={10} color="#4A90E2" style={{ marginLeft: 4 }} />
                          </TouchableOpacity>

                          {/* Dropdown de Meses - Posição Absoluta */}
                          {showMonthPicker && (
                            <View style={styles.calendarDropdownMonth}>
                              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled showsVerticalScrollIndicator>
                                {nomesMeses.map((mes, index) => (
                                  <TouchableOpacity
                                    key={index}
                                    style={[
                                      styles.calendarDropdownItem,
                                      calendarMonth === index && styles.calendarDropdownItemSelected,
                                    ]}
                                    onPress={() => {
                                      setCalendarMonth(index);
                                      setShowMonthPicker(false);
                                    }}
                                  >
                                    <Text style={[
                                      styles.calendarDropdownText,
                                      calendarMonth === index && styles.calendarDropdownTextSelected,
                                    ]}>
                                      {mes}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}
                        </View>

                        {/* Seletor de Ano */}
                        <View style={{ position: 'relative', zIndex: 101 }}>
                          <TouchableOpacity 
                            style={[styles.calendarYearSelector, { backgroundColor: theme.background, borderColor: theme.border }]}
                            onPress={() => {
                              setShowYearPicker(!showYearPicker);
                              setShowMonthPicker(false);
                            }}
                          >
                            <Text style={[styles.calendarYearText, isSmallScreen && { fontSize: 13 }]}>
                              {calendarYear}
                            </Text>
                            <FontAwesome5 name="caret-down" size={10} color="#4A90E2" style={{ marginLeft: 4 }} />
                          </TouchableOpacity>

                          {/* Dropdown de Anos - Posição Absoluta */}
                          {showYearPicker && (
                            <View style={styles.calendarDropdownYear}>
                              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled showsVerticalScrollIndicator>
                                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((ano) => (
                                  <TouchableOpacity
                                    key={ano}
                                    style={[
                                      styles.calendarDropdownItem,
                                      calendarYear === ano && styles.calendarDropdownItemSelected,
                                    ]}
                                    onPress={() => {
                                      setCalendarYear(ano);
                                      setShowYearPicker(false);
                                    }}
                                  >
                                    <Text style={[
                                      styles.calendarDropdownText,
                                      calendarYear === ano && styles.calendarDropdownTextSelected,
                                    ]}>
                                      {ano}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}
                        </View>
                      </View>

                      <TouchableOpacity onPress={proximoMes} style={[styles.calendarNavButton, isSmallScreen && { width: 28, height: 28 }]}>
                        <FontAwesome5 name="chevron-right" size={isSmallScreen ? 10 : 12} color="#4A90E2" />
                      </TouchableOpacity>
                    </View>

                    {/* Dias da Semana */}
                    <View style={[styles.calendarWeekDays, { zIndex: 1, borderBottomColor: theme.border }]}>
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                        <Text key={dia} style={[styles.calendarWeekDay, { width: daySize, fontSize: isSmallScreen ? 10 : 12, color: theme.textMuted }]}>{dia}</Text>
                      ))}
                    </View>

                    {/* Grid de Dias */}
                    <View style={[styles.calendarDaysGrid, { zIndex: 1 }]}>
                      {gerarDiasDoMes().map((dia, index) => {
                        const hoje = new Date();
                        const dataAtual = dia ? new Date(calendarYear, calendarMonth, dia) : null;
                        const isFuturo = dataAtual && dataAtual > hoje;
                        const isSelecionado = dia && 
                          dataSelecionada.getDate() === dia && 
                          dataSelecionada.getMonth() === calendarMonth && 
                          dataSelecionada.getFullYear() === calendarYear;

                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.calendarDay,
                              { width: daySize, height: daySize },
                              isSelecionado && styles.calendarDaySelected,
                              isFuturo && styles.calendarDayDisabled,
                            ]}
                            onPress={() => dia && !isFuturo && selecionarDia(dia)}
                            disabled={!dia || isFuturo}
                            activeOpacity={0.7}
                          >
                            {dia && (
                              <Text style={[
                                styles.calendarDayText,
                                { fontSize: isSmallScreen ? 12 : 14, color: theme.text },
                                isSelecionado && styles.calendarDayTextSelected,
                                isFuturo && styles.calendarDayTextDisabled,
                              ]}>
                                {dia}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Botão Limpar */}
                    <TouchableOpacity 
                      style={[styles.calendarClearButton, { borderTopColor: theme.border }]}
                      onPress={() => {
                        setDataNascimento('');
                        setIdade('');
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={[styles.calendarClearText, isSmallScreen && { fontSize: 12 }]}>Limpar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}

            {/* Seção: Dados Físicos */}
            <View style={[styles.formSectionTitle, { borderBottomColor: theme.border }]}>
              <FontAwesome5 name="ruler-vertical" size={16} color="#4A90E2" />
              <Text style={styles.formSectionTitleText}>Dados Físicos</Text>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.inputHalf, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <View style={styles.inputIcon}>
                  <FontAwesome5 name="weight" size={16} color="#4A90E2" />
                </View>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Peso (kg) *"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="number-pad"
                  value={peso}
                  onChangeText={(texto) => setPeso(formatarPeso(texto))}
                  maxLength={6}
                />
              </View>
              <View style={[styles.inputGroup, styles.inputHalf, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <View style={styles.inputIcon}>
                  <FontAwesome5 name="ruler-vertical" size={16} color="#4A90E2" />
                </View>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Altura (m) *"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="number-pad"
                  value={altura}
                  onChangeText={(texto) => setAltura(formatarAltura(texto))}
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 name="venus-mars" size={14} color="#4A90E2" />
                <Text style={[styles.label, { color: theme.text }]}>Sexo *</Text>
              </View>
              <View style={styles.optionRow}>
                {['Masculino', 'Feminino', 'Outro'].map((opcao) => (
                  <TouchableOpacity
                    key={opcao}
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      sexo === opcao && styles.optionSelected,
                    ]}
                    onPress={() => setSexo(opcao)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: theme.textMuted },
                      sexo === opcao && styles.optionTextSelected
                    ]}>
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 name="globe-americas" size={14} color="#4A90E2" />
                <Text style={[styles.label, { color: theme.text }]}>Etnia *</Text>
              </View>
              <View style={styles.optionRow}>
                {['Branca', 'Parda', 'Preta', 'Amarela', 'Indígena'].map((opcao) => (
                  <TouchableOpacity
                    key={opcao}
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      etnia === opcao && styles.optionSelected,
                    ]}
                    onPress={() => setEtnia(opcao)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: theme.textMuted },
                      etnia === opcao && styles.optionTextSelected
                    ]}>
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Seção: Exame */}
            <View style={[styles.formSectionTitle, { borderBottomColor: theme.border }]}>
              <FontAwesome5 name="x-ray" size={16} color="#4A90E2" />
              <Text style={styles.formSectionTitleText}>Tipo de Exame *</Text>
            </View>

            <Text style={[styles.examInstructions, { color: theme.textMuted }]}>
              Clique em um tipo de exame para selecionar a imagem da galeria
            </Text>

            <View style={styles.section}>
              <View style={styles.examOptions}>
                {[
                  { nome: 'Coluna Lombar' },
                  { nome: 'Fêmur' },
                  { nome: 'Punho' },
                  { nome: 'Corpo Total' }
                ].map((opcao) => (
                  <TouchableOpacity
                    key={opcao.nome}
                    style={[
                      styles.examCard,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      exame === opcao.nome && styles.examCardSelected,
                    ]}
                    onPress={() => selecionarExameComImagem(opcao.nome)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.examText,
                      { color: theme.textMuted },
                      exame === opcao.nome && styles.examTextSelected
                    ]}>
                      {opcao.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview da Imagem Selecionada */}
            {imagemExame && (
              <View style={[styles.imagePreviewContainer, { backgroundColor: theme.background, borderColor: '#4A90E2' }]}>
                <View style={styles.imagePreviewHeader}>
                  <Text style={styles.imagePreviewTitle}>Imagem Selecionada</Text>
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={removerImagem}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5 name="times" size={14} color="#FF4444" />
                    <Text style={styles.removeImageText}>Remover</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.imagePreviewWrapper}>
                  <Image 
                    source={{ uri: imagemExame }} 
                    style={styles.imagePreview}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.imagePreviewExamType, { color: theme.textMuted }]}>
                  Tipo: {exame}
                </Text>
                {imagemHash && (
                  <Text style={styles.imagePreviewHash}>
                    ID: {imagemHash}
                  </Text>
                )}
              </View>
            )}

            {/* Seção: Informações Adicionais */}
            <View style={[styles.formSectionTitle, { borderBottomColor: theme.border }]}>
              <FontAwesome5 name="clipboard-list" size={16} color="#4A90E2" />
              <Text style={styles.formSectionTitleText}>Informações Adicionais</Text>
            </View>

            <View style={[styles.inputGroup, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.inputIcon}>
                <FontAwesome5 name="user-md" size={16} color="#4A90E2" />
              </View>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Nome do operador/técnico"
                placeholderTextColor={theme.textMuted}
                value={operador}
                onChangeText={setOperador}
              />
            </View>

            <Text style={[styles.requiredNote, { color: theme.textMuted }]}>* Campos obrigatórios</Text>
          </View>

          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={iniciarEscaneamento}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="heartbeat" size={18} color="#FFFFFF" />
            <Text style={styles.scanText}>Iniciar Escaneamento</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Animação de Sucesso */}
      {showSuccessAnimation && (
        <View style={styles.successOverlay}>
          {/* Partículas */}
          {particleAnimations.map((particle, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  transform: [
                    { translateX: particle.translateX },
                    { translateY: particle.translateY },
                    { scale: particle.scale },
                  ],
                  opacity: particle.opacity,
                  backgroundColor: index % 2 === 0 ? '#4A90E2' : '#00D9FF',
                },
              ]}
            />
          ))}

          {/* Círculo de Sucesso */}
          <Animated.View
            style={[
              styles.successCircle,
              {
                transform: [{ scale: successScale }],
                opacity: successOpacity,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.checkmarkContainer,
                {
                  transform: [{ scale: checkmarkScale }],
                },
              ]}
            >
              <FontAwesome5 name="check" size={50} color="#FFFFFF" />
            </Animated.View>
          </Animated.View>

          {/* Texto de Sucesso */}
          <Animated.Text
            style={[
              styles.successText,
              {
                opacity: successOpacity,
                transform: [{ scale: successScale }],
              },
            ]}
          >
            Paciente Cadastrado!
          </Animated.Text>
        </View>
      )}

      {/* Alert Customizado */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 52,
  },
  inputIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.text,
    minWidth: 0,
  },
  section: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: theme.background,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  optionSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  examOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  examCard: {
    width: '48%',
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 90,
  },
  examCardSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  examText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
    textAlign: 'center',
  },
  examTextSelected: {
    color: '#FFFFFF',
  },
  examDesc: {
    fontSize: 10,
    color: theme.textFaint,
    textAlign: 'center',
  },
  examDescSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  // Estilos para exame desabilitado
  examCardDisabled: {
    opacity: 0.4,
    backgroundColor: '#15171f',
    borderColor: '#2a2f3a',
  },
  examTextDisabled: {
    color: '#555',
  },
  examDescDisabled: {
    color: '#444',
  },
  examSelectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#2ECC71',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examInstructions: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Estilos para preview de imagem
  imagePreviewContainer: {
    marginTop: 16,
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  imagePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 5,
  },
  removeImageText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
  },
  imagePreviewWrapper: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#0d0f14',
  },
  imagePreviewExamType: {
    marginTop: 8,
    fontSize: 12,
    color: theme.textMuted,
  },
  imagePreviewHash: {
    marginTop: 4,
    fontSize: 10,
    color: '#4A90E2',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },
  // Novos estilos para seções do formulário
  formSectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  formSectionTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A90E2',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputHalf: {
    flex: 1,
    minWidth: 120,
    marginBottom: 0,
  },
  // Estilos do DatePicker
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 14,
    color: theme.text,
  },
  datePickerPlaceholder: {
    color: theme.textFaint,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 350,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  datePickerConfirmButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  datePickerConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Estilos do Calendário Customizado
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  calendarContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarMonthYear: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarMonthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  calendarMonthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  calendarYearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  calendarYearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  calendarDropdownMonth: {
    position: 'absolute',
    top: '100%',
    left: 0,
    minWidth: 120,
    backgroundColor: theme.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    zIndex: 9999,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 999,
  },
  calendarDropdownYear: {
    position: 'absolute',
    top: '100%',
    right: 0,
    minWidth: 80,
    backgroundColor: theme.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    zIndex: 9999,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 999,
  },
  calendarDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  calendarDropdownItemSelected: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
  },
  calendarDropdownText: {
    fontSize: 13,
    color: theme.text,
    textAlign: 'center',
  },
  calendarDropdownTextSelected: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  calendarWeekDay: {
    textAlign: 'center',
    fontWeight: '600',
    color: theme.textMuted,
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDay: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  calendarDaySelected: {
    backgroundColor: '#4A90E2',
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '500',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarDayTextDisabled: {
    color: theme.textFaint,
  },
  calendarClearButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  calendarClearText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 11,
    color: theme.textFaint,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
  },
  scanText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 29, 41, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 30,
    textAlign: 'center',
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
});
