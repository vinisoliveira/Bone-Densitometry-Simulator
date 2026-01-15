import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated, Easing, Image, Modal, Dimensions, useWindowDimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography } from '../src/styles/theme';
import { salvarImagemExame } from '../utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomAlert from '../src/components/CustomAlert';
import { useCustomAlert } from '../src/hooks/useCustomAlert';

// Função para formatar data com máscara DD/MM/AAAA
const formatarData = (texto) => {
  // Remove tudo que não é número
  let numeros = texto.replace(/\D/g, '');
  
  // Limita a 8 dígitos (DDMMAAAA)
  numeros = numeros.substring(0, 8);
  
  // Aplica a máscara
  if (numeros.length <= 2) {
    return numeros;
  } else if (numeros.length <= 4) {
    return `${numeros.substring(0, 2)}/${numeros.substring(2)}`;
  } else {
    return `${numeros.substring(0, 2)}/${numeros.substring(2, 4)}/${numeros.substring(4)}`;
  }
};

// Função para converter string DD/MM/AAAA para Date
const stringParaData = (dataString) => {
  if (!dataString || dataString.length !== 10) return new Date(2000, 0, 1);
  const [dia, mes, ano] = dataString.split('/').map(Number);
  return new Date(ano, mes - 1, dia);
};

// Função para converter Date para string DD/MM/AAAA
const dataParaString = (data) => {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

// Função para formatar peso com máscara (ex: 72,5 - máx 3 dígitos + 1 decimal)
const formatarPeso = (texto) => {
  // Remove tudo que não é número ou vírgula
  let valor = texto.replace(/[^0-9,]/g, '');
  
  // Permite apenas uma vírgula
  const partes = valor.split(',');
  if (partes.length > 2) {
    valor = partes[0] + ',' + partes.slice(1).join('');
  }
  
  // Limita a parte inteira a 3 dígitos (máx 999 kg)
  if (partes[0] && partes[0].length > 3) {
    partes[0] = partes[0].substring(0, 3);
    valor = partes.length > 1 ? partes[0] + ',' + partes[1] : partes[0];
  }
  
  // Limita a parte decimal a 1 dígito
  if (partes.length > 1 && partes[1].length > 1) {
    valor = partes[0] + ',' + partes[1].substring(0, 1);
  }
  
  return valor;
};

// Função para formatar altura com máscara em metros (ex: 1,75 - máx 1 dígito + 2 decimais)
const formatarAltura = (texto) => {
  // Remove tudo que não é número ou vírgula
  let valor = texto.replace(/[^0-9,]/g, '');
  
  // Permite apenas uma vírgula
  const partes = valor.split(',');
  if (partes.length > 2) {
    valor = partes[0] + ',' + partes.slice(1).join('');
  }
  
  // Limita a parte inteira a 1 dígito (máx 9 metros)
  if (partes[0] && partes[0].length > 1) {
    partes[0] = partes[0].substring(0, 1);
    valor = partes.length > 1 ? partes[0] + ',' + partes[1] : partes[0];
  }
  
  // Limita a parte decimal a 2 dígitos (centímetros)
  if (partes.length > 1 && partes[1].length > 2) {
    valor = partes[0] + ',' + partes[1].substring(0, 2);
  }
  
  return valor;
};

export default function CadastroScreen({ navigation }) {
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 400;
  const calendarWidth = Math.min(windowWidth * 0.92, 400);
  const daySize = (calendarWidth - 40) / 7; // 40 = padding total
  
  const { alertConfig, showAlert, hideAlert } = useCustomAlert();
  
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

    // Abrir seletor de imagem
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      
      // Salvar imagem no storage com hash
      const dadosImagem = await salvarImagemExame(uri, tipoExame);
      
      if (dadosImagem) {
        setExame(tipoExame);
        setImagemExame(uri);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.title}>Novo Exame</Text>
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
          <View style={styles.formCard}>
            {/* Seção: Dados Pessoais */}
            <View style={styles.formSectionTitle}>
              <FontAwesome5 name="user-circle" size={16} color="#4A90E2" />
              <Text style={styles.formSectionTitleText}>Dados Pessoais</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FontAwesome5 name="user" size={16} color="#4A90E2" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nome do paciente *"
                placeholderTextColor="#666"
                value={paciente}
                onChangeText={setPaciente}
              />
            </View>

            <View style={styles.inputRow}>
              {/* Data de Nascimento primeiro */}
              <TouchableOpacity 
                style={[styles.inputGroup, styles.inputHalf]}
                onPress={abrirCalendario}
                activeOpacity={0.7}
              >
                <View style={styles.inputIcon}>
                  <FontAwesome5 name="calendar-alt" size={16} color="#4A90E2" />
                </View>
                <Text style={[styles.datePickerText, !dataNascimento && styles.datePickerPlaceholder]}>
                  {dataNascimento || 'Data Nasc. *'}
                </Text>
              </TouchableOpacity>

              {/* Idade depois */}
              <View style={[styles.inputGroup, styles.inputHalf]}>
                <View style={styles.inputIcon}>
                  <FontAwesome5 name="birthday-cake" size={16} color="#4A90E2" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Idade *"
                  placeholderTextColor="#666"
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
                    style={[styles.calendarContainer, { width: calendarWidth }]} 
                  >
                    {/* Header do Calendário */}
                    <View style={styles.calendarHeader}>
                      <Text style={[styles.calendarTitle, isSmallScreen && { fontSize: 14 }]}>Data de Nascimento</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <FontAwesome5 name="times" size={isSmallScreen ? 16 : 18} color="#999" />
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
                            style={styles.calendarMonthSelector}
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
                            style={styles.calendarYearSelector}
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
                    <View style={[styles.calendarWeekDays, { zIndex: 1 }]}>
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                        <Text key={dia} style={[styles.calendarWeekDay, { width: daySize, fontSize: isSmallScreen ? 10 : 12 }]}>{dia}</Text>
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
                                { fontSize: isSmallScreen ? 12 : 14 },
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
                      style={styles.calendarClearButton}
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
            <View style={styles.formSectionTitle}>
              <FontAwesome5 name="ruler-vertical" size={16} color="#4A90E2" />
              <Text style={styles.formSectionTitleText}>Dados Físicos</Text>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.inputHalf]}>
                <View style={styles.inputIcon}>
                  <FontAwesome5 name="weight" size={16} color="#4A90E2" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Peso (kg) *"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={peso}
                  onChangeText={(texto) => setPeso(formatarPeso(texto))}
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, styles.inputHalf]}>
                <View style={styles.inputIcon}>
                  <FontAwesome5 name="ruler-vertical" size={16} color="#4A90E2" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Altura (m) *"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={altura}
                  onChangeText={(texto) => setAltura(formatarAltura(texto))}
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 name="venus-mars" size={14} color="#4A90E2" />
                <Text style={styles.label}>Sexo *</Text>
              </View>
              <View style={styles.optionRow}>
                {['Masculino', 'Feminino', 'Outro'].map((opcao) => (
                  <TouchableOpacity
                    key={opcao}
                    style={[
                      styles.optionButton,
                      sexo === opcao && styles.optionSelected,
                    ]}
                    onPress={() => setSexo(opcao)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionText,
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
                <Text style={styles.label}>Etnia *</Text>
              </View>
              <View style={styles.optionRow}>
                {['Branca', 'Parda', 'Preta', 'Amarela', 'Indígena'].map((opcao) => (
                  <TouchableOpacity
                    key={opcao}
                    style={[
                      styles.optionButton,
                      etnia === opcao && styles.optionSelected,
                    ]}
                    onPress={() => setEtnia(opcao)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionText,
                      etnia === opcao && styles.optionTextSelected
                    ]}>
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Seção: Exame */}
            <View style={styles.formSectionTitle}>
              <FontAwesome5 name="x-ray" size={16} color="#4A90E2" />
              <Text style={styles.formSectionTitleText}>Tipo de Exame *</Text>
            </View>

            <Text style={styles.examInstructions}>
              Clique em um tipo de exame para selecionar a imagem da galeria
            </Text>

            <View style={styles.section}>
              <View style={styles.examOptions}>
                {[
                  { nome: 'Coluna Lombar', desc: 'L1-L4' },
                  { nome: 'Fêmur', desc: 'Proximal' },
                  { nome: 'Punho', desc: 'Antebraço' },
                  { nome: 'Corpo Total', desc: 'Full Body' }
                ].map((opcao) => {
                  const isSelected = exame === opcao.nome;
                  const isDisabled = imagemExame && exame !== opcao.nome;
                  
                  return (
                    <TouchableOpacity
                      key={opcao.nome}
                      style={[
                        styles.examCard,
                        isSelected && styles.examCardSelected,
                        isDisabled && styles.examCardDisabled,
                      ]}
                      onPress={() => !isDisabled && selecionarExameComImagem(opcao.nome)}
                      activeOpacity={isDisabled ? 1 : 0.7}
                      disabled={isDisabled}
                    >
                      <Text style={[
                        styles.examText,
                        isSelected && styles.examTextSelected,
                        isDisabled && styles.examTextDisabled,
                      ]}>
                        {opcao.nome}
                      </Text>
                      <Text style={[
                        styles.examDesc,
                        isSelected && styles.examDescSelected,
                        isDisabled && styles.examDescDisabled,
                      ]}>
                        {opcao.desc}
                      </Text>
                      {isSelected && imagemExame && (
                        <View style={styles.examSelectedBadge}>
                          <FontAwesome5 name="check" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Preview da Imagem Selecionada */}
            {imagemExame && (
              <View style={styles.imagePreviewContainer}>
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
                <Text style={styles.imagePreviewExamType}>
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
            <View style={styles.formSectionTitle}>
              <FontAwesome5 name="clipboard-list" size={16} color="#4A90E2" />
              <Text style={styles.formSectionTitleText}>Informações Adicionais</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FontAwesome5 name="user-md" size={16} color="#4A90E2" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nome do operador/técnico"
                placeholderTextColor="#666"
                value={operador}
                onChangeText={setOperador}
              />
            </View>

            <Text style={styles.requiredNote}>* Campos obrigatórios</Text>
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
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: '#2a3142',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d29',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#3a3f52',
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#1a1d29',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3a3f52',
  },
  optionSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionText: {
    color: '#999',
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
    backgroundColor: '#1a1d29',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#3a3f52',
    minHeight: 90,
  },
  examCardSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  examText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
  },
  examTextSelected: {
    color: '#FFFFFF',
  },
  examDesc: {
    fontSize: 10,
    color: '#666',
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
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Estilos para preview de imagem
  imagePreviewContainer: {
    marginTop: 16,
    backgroundColor: '#1a1d29',
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
    color: '#999',
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
    borderBottomColor: '#3a3f52',
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
    color: '#FFFFFF',
  },
  datePickerPlaceholder: {
    color: '#666',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: '#2a3142',
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
    color: '#FFFFFF',
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
    backgroundColor: '#2a3142',
    borderRadius: 16,
    padding: 20,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#3a3f52',
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
    borderBottomColor: '#3a3f52',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: '#1a1d29',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3a3f52',
  },
  calendarMonthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  calendarYearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d29',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3a3f52',
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
    backgroundColor: '#1a1d29',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3f52',
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
    backgroundColor: '#1a1d29',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3f52',
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
    borderBottomColor: '#2a3142',
  },
  calendarDropdownItemSelected: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
  },
  calendarDropdownText: {
    fontSize: 13,
    color: '#FFFFFF',
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
    borderBottomColor: '#3a3f52',
  },
  calendarWeekDay: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#888',
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
    color: '#FFFFFF',
    fontWeight: '500',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarDayTextDisabled: {
    color: '#666',
  },
  calendarClearButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#3a3f52',
  },
  calendarClearText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 11,
    color: '#666',
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
