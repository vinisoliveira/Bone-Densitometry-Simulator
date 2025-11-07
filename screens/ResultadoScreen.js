import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  PanResponder,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography } from '../src/styles/theme';
import { useNavigation } from '@react-navigation/native';
import { salvarPaciente } from '../utils/storage';
import { FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ResultadoScreen({ route }) {
  const { id, nome, idade, sexo, etnia, exame } = route.params;
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [isInverted, setIsInverted] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  
  // ROIs e ferramentas
  const [rois, setRois] = useState([]);
  const [selectedRoiId, setSelectedRoiId] = useState(null);
  const [toolMode, setToolMode] = useState('select'); // 'select', 'rectangle', 'circle', 'polygon', 'measure'
  const [measurements, setMeasurements] = useState([]);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [roiPositions, setRoiPositions] = useState({});
  const [validatedROIs, setValidatedROIs] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [calculatedBMD, setCalculatedBMD] = useState({});
  
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const saveSuccessAnim = useRef(new Animated.Value(0)).current;

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

  // Imagens por exame
  const imagemExame = {
    'Coluna Lombar': require('../assets/coluna-lombar.jpeg'),
    'Fêmur': require('../assets/femur.jpeg'),
    'Punho': require('../assets/punho.png'),
  };

  // Dimensões da imagem
  const imageWidth = width - 40;
  const imageHeight = height * 0.5;
  
  // Templates de ROI por tipo de exame (didáticos e baseados em padrões reais)
  const templatesROI = {
    'Coluna Lombar': [
      { 
        id: 'L1', 
        name: 'L1 - Primeira Vértebra Lombar',
        type: 'rectangle',
        x: imageWidth * 0.23, 
        y: imageHeight * 0.06, 
        width: imageWidth * 0.55, 
        height: imageHeight * 0.18,
        color: '#4A90E2',
        description: 'ROI sobre a primeira vértebra lombar. Deve incluir toda a área do corpo vertebral.',
        tips: 'Centralize sobre o corpo vertebral, evitando os processos espinhosos.'
      },
      { 
        id: 'L2', 
        name: 'L2 - Segunda Vértebra Lombar',
        type: 'rectangle',
        x: imageWidth * 0.23, 
        y: imageHeight * 0.24, 
        width: imageWidth * 0.55, 
        height: imageHeight * 0.18,
        color: '#4A90E2',
        description: 'ROI sobre a segunda vértebra lombar.',
        tips: 'Mantenha alinhamento com L1 e L3.'
      },
      { 
        id: 'L3', 
        name: 'L3 - Terceira Vértebra Lombar',
        type: 'rectangle',
        x: imageWidth * 0.23, 
        y: imageHeight * 0.42, 
        width: imageWidth * 0.55, 
        height: imageHeight * 0.18,
        color: '#4A90E2',
        description: 'ROI sobre a terceira vértebra lombar.',
        tips: 'Vértebra central da coluna lombar inferior.'
      },
      { 
        id: 'L4', 
        name: 'L4 - Quarta Vértebra Lombar',
        type: 'rectangle',
        x: imageWidth * 0.23, 
        y: imageHeight * 0.60, 
        width: imageWidth * 0.55, 
        height: imageHeight * 0.16,
        color: '#4A90E2',
        description: 'ROI sobre a quarta vértebra lombar.',
        tips: 'Última vértebra antes da junção lombossacral.'
      },
    ],
    'Fêmur': [
      { 
        id: 'femoral-neck', 
        name: 'Colo do Fêmur (Femoral Neck)',
        type: 'rectangle',
        x: imageWidth * 0.50, 
        y: imageHeight * 0.38, 
        width: imageWidth * 0.35, 
        height: imageHeight * 0.10,
        rotation: -45,
        color: '#4A90E2',
        description: 'ROI sobre o colo femoral - região crítica para fraturas.',
        tips: 'Posicione ao longo do eixo do colo, evitando o trocanter e a cabeça femoral.'
      },
      { 
        id: 'trochanter', 
        name: '-',
        type: 'rectangle',
        x: imageWidth * 0.10, 
        y: imageHeight * 0.32, 
        width: imageWidth * 0.00, 
        height: imageHeight * 0.0,
        color: '#FFB74D',
        description: 'ROI sobre o trocanter maior.',
        tips: 'Proeminência óssea lateral do fêmur proximal.'
      },
      { 
        id: 'wards-triangle', 
        name: "CI",
        type: 'triangle',
        x: imageWidth * 0.68, 
        y: imageHeight * 0.41, 
        width: imageWidth * 0.09, 
        height: imageHeight * 0.09,
        rotation: -45,
        color: '#E57373',
        description: 'Região triangular de baixa densidade óssea no fêmur proximal.',
        tips: 'Área triangular entre o colo femoral e o trocanter.',
        // vertices definidas em coordenadas relativas (0..1) para um triângulo isósceles apontando para baixo
        vertices: [
          { x: 0.5, y: 0 },   // topo
          { x: 1,   y: 1 },   // canto direito
          { x: 0,   y: 1 },   // canto esquerdo
        ]
      },

    ],
    'Punho': [
      { 
        id: 'ulna-ud', 
        name: 'Ulna UD',
        type: 'rectangle',
        x: imageWidth * 0.255, 
        y: imageHeight * 0.30, 
        width: imageWidth * 0.21, 
        height: imageHeight * 0.08,
        color: '#4A90E2',
        description: 'Região mais distal do rádio, rica em osso trabecular.',
        tips: 'Posicione na extremidade do rádio, próximo à articulação.'
      },
      { 
        id: 'ulna-medio', 
        name: 'Ulna Médio',
        type: 'rectangle',
        x: imageWidth * 0.255, 
        y: imageHeight * 0.378, 
        width: imageWidth * 0.21, 
        height: imageHeight * 0.18,
        color: '#FFB74D',
        description: 'Região a 33% (1/3) da distância do rádio distal.',
        tips: 'Osso cortical predominante, útil para avaliar perda óssea cortical.'
      },
      { 
        id: 'ulna-33', 
        name: 'Ulna 33%',
        type: 'rectangle',
        x: imageWidth * 0.255, 
        y: imageHeight * 0.555, 
        width: imageWidth * 0.21, 
        height: imageHeight * 0.08,
        color: '#81C784',
        description: 'Região média da diáfise radial.',
        tips: 'Área com osso cortical espesso.'
      },
      { 
        id: 'radius-ud', 
        name: 'Rádio UD',
        type: 'rectangle',
        x: imageWidth * 0.465, 
        y: imageHeight * 0.30, 
        width: imageWidth * 0.21, 
        height: imageHeight * 0.08,
        color: '#4A90E2',
        description: 'Região mais distal do rádio, rica em osso trabecular.',
        tips: 'Posicione na extremidade do rádio, próximo à articulação.'
      },
      { 
        id: 'radius-medium', 
        name: 'Rádio Médio',
        type: 'rectangle',
        x: imageWidth * 0.465, 
        y: imageHeight * 0.378, 
        width: imageWidth * 0.21, 
        height: imageHeight * 0.18,
        color: '#FFB74D',
        description: 'Região a 33% (1/3) da distância do rádio distal.',
        tips: 'Osso cortical predominante, útil para avaliar perda óssea cortical.'
      },
      { 
        id: 'radius-33', 
        name: 'Rádio 33%',
        type: 'rectangle',
        x: imageWidth * 0.465, 
        y: imageHeight * 0.555, 
        width: imageWidth * 0.21, 
        height: imageHeight * 0.08,
        color: '#81C784',
        description: 'Região média da diáfise radial.',
        tips: 'Área com osso cortical espesso.'
      },
    ],
  };

  // Inicializar ROIs com templates
  useEffect(() => {
    const templates = templatesROI[exame] || [];
    // Garantir IDs únicos mesmo se template.id for vazio/duplicado
    const timestamp = Date.now();
    const initialROIs = templates.map((template, idx) => ({
      ...template,
      id: `${template.id && template.id.toString().trim() !== '' ? template.id : 'roi'}-${timestamp}-${idx}`,
      correctX: template.x, // Salvar posição correta
      correctY: template.y, // Salvar posição correta
      isLocked: false,
      isVisible: true,
      opacity: 0.6,
    }));
    setRois(initialROIs);
    
    // Inicializar posições das ROIs (começam EXATAMENTE nas posições corretas)
    const initialPositions = {};
    
    initialROIs.forEach((roi) => {
      // ROIs começam exatamente onde devem ficar (nas guias tracejadas)
      initialPositions[roi.id] = {
        x: roi.x,
        y: roi.y,
      };
    });
    setRoiPositions(initialPositions);
  }, [exame]);

  // Instruções por tipo de exame
  const instrucoesPorExame = {
    'Coluna Lombar': 'Posicione as ROIs sobre as vértebras lombares (L1-L4). Cada ROI deve cobrir todo o corpo vertebral, evitando os processos espinhosos. Mantenha alinhamento vertical entre as ROIs.',
    'Fêmur': 'Posicione as ROIs sobre o fêmur proximal. O Colo Femoral deve ser perpendicular ao eixo femoral. O Triângulo de Ward fica na parte inferior do colo. O Trocanter maior fica acima do colo.',
    'Punho': 'Posicione as ROIs sobre o rádio e ulna. O Rádio Ultra-Distal fica na extremidade, o Rádio 33% a 1/3 da distância, e o Rádio Médio no meio da diáfise. A Ulna Distal fica ao lado do rádio ultra-distal.',
  };

  // Regiões é o mesmo que rois (para compatibilidade)
  const regioes = rois;

  // Funções de manipulação de ROI
  const addROI = (type) => {
    const newROI = {
      id: `roi-${Date.now()}`,
      name: `ROI ${rois.length + 1}`,
      type,
      x: imageWidth * 0.3,
      y: imageHeight * 0.3,
      width: imageWidth * 0.2,
      height: imageHeight * 0.15,
      color: '#4A90E2',
      isLocked: false,
      isVisible: true,
      opacity: 0.6,
      rotation: 0,
    };
    setRois([...rois, newROI]);
    setSelectedRoiId(newROI.id);
  };

  const deleteROI = (roiId) => {
    Alert.alert(
      'Excluir ROI',
      'Deseja realmente excluir esta região de interesse?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            setRois(rois.filter(r => r.id !== roiId));
            if (selectedRoiId === roiId) setSelectedRoiId(null);
          }
        },
      ]
    );
  };

  const duplicateROI = (roiId) => {
    const roi = rois.find(r => r.id === roiId);
    if (roi) {
      const newROI = {
        ...roi,
        id: `roi-${Date.now()}`,
        name: `${roi.name} (Cópia)`,
        x: roi.x + 20,
        y: roi.y + 20,
      };
      setRois([...rois, newROI]);
      setSelectedRoiId(newROI.id);
    }
  };

  const toggleROIVisibility = (roiId) => {
    setRois(rois.map(r => r.id === roiId ? { ...r, isVisible: !r.isVisible } : r));
  };

  const toggleROILock = (roiId) => {
    setRois(rois.map(r => r.id === roiId ? { ...r, isLocked: !r.isLocked } : r));
  };

  const updateROI = (roiId, updates) => {
    setRois(rois.map(r => r.id === roiId ? { ...r, ...updates } : r));
  };

  // Criar PanResponder para ROI
  const createROIPanResponder = (roi) => {
    if (roi.isLocked) return {};
    
    return PanResponder.create({
      onStartShouldSetPanResponder: () => toolMode === 'select',
      onMoveShouldSetPanResponder: () => toolMode === 'select',
      onPanResponderGrant: () => {
        setSelectedRoiId(roi.id);
      },
      onPanResponderMove: (evt, gestureState) => {
        updateROI(roi.id, {
          x: roi.x + gestureState.dx / zoom,
          y: roi.y + gestureState.dy / zoom,
        });
      },
      onPanResponderRelease: () => {},
    });
  };

  // Função para calcular estilos de imagem
  const getImageStyle = () => {
    const imageOpacity = brightness >= 1 ? 1 : 0.6 + (brightness * 0.4);
    const brightnessOverlay = brightness > 1 
      ? { color: 'rgba(255, 255, 255, 0.3)', opacity: (brightness - 1) * 0.5 }
      : null;
    
    return {
      imageOpacity,
      brightnessOverlay,
      opacity: brightness,
      transform: [
        { scale: zoom },
        ...(isInverted ? [{ scaleX: -1 }] : [])
      ],
    };
  };

  // Calcular densidade simulada de uma ROI
  const calculateROIDensity = (roi) => {
    // Simulação baseada em posição e tamanho
    const baseValue = 0.8 + (Math.random() * 0.4);
    return baseValue.toFixed(3);
  };

  // Resetar todas as ferramentas
  const resetTools = () => {
    setBrightness(1.0);
    setContrast(1.0);
    setZoom(1.0);
    setIsInverted(false);
  };

  // Criar PanResponder para arrastar ROIs - VERSÃO SIMPLES
  const criarPanResponder = (roiId) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: () => {
        setSelectedId(roiId);
      },
      
      onPanResponderMove: (evt, gestureState) => {
        // Pegar posição do template
        const roi = regioes.find(r => r.id === roiId);
        if (!roi) return;
        
        // Calcular nova posição: posição original + movimento do gesto
        setRoiPositions(prev => ({
          ...prev,
          [roiId]: {
            x: roi.x + gestureState.dx,
            y: roi.y + gestureState.dy,
          }
        }));
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        // Salvar posição final
        const roi = regioes.find(r => r.id === roiId);
        if (!roi) return;
        
        const finalX = roi.x + gestureState.dx;
        const finalY = roi.y + gestureState.dy;
        
        // Atualizar a posição do ROI no template
        setRois(prevRois => 
          prevRois.map(r => 
            r.id === roiId 
              ? { ...r, x: finalX, y: finalY }
              : r
          )
        );
        
        // Atualizar posição
        setRoiPositions(prev => ({
          ...prev,
          [roiId]: {
            x: finalX,
            y: finalY,
          }
        }));
      },
    });
  };

  // Validar todas as ROIs
  const validarTodasROIs = () => {
    const validated = {};
    const bmdResults = {};
    
    regioes.forEach(regiao => {
      const position = roiPositions[regiao.id] || { x: 0, y: 0 };
      const correctX = regiao.correctX || regiao.x;
      const correctY = regiao.correctY || regiao.y;
      
      // Tolerância de 50 pixels (mais generosa)
      const tolerance = 50;
      const distanceX = Math.abs(position.x - correctX);
      const distanceY = Math.abs(position.y - correctY);
      const isCorrect = distanceX < tolerance && distanceY < tolerance;
      
      validated[regiao.id] = isCorrect;
      
      // Calcular BMD simulado (valores realistas)
      const baseBMD = 0.750 + (Math.random() * 0.350); // Entre 0.750 e 1.100 g/cm²
      const tScore = ((baseBMD - 1.0) / 0.125); // T-Score simulado
      const zScore = ((baseBMD - 0.950) / 0.125); // Z-Score simulado
      
      bmdResults[regiao.id] = {
        bmd: baseBMD.toFixed(3),
        tScore: tScore.toFixed(1),
        zScore: zScore.toFixed(1),
        area: (regiao.width * regiao.height / 1000).toFixed(2), // cm²
      };
    });
    
    setValidatedROIs(validated);
    setCalculatedBMD(bmdResults);
    setShowResults(true);
    
    // Feedback para o usuário
    const allCorrect = Object.values(validated).every(v => v === true);
    const correctCount = Object.values(validated).filter(v => v === true).length;
    
    if (allCorrect) {
      Alert.alert(
        '🎉 Excelente!',
        'Todas as ROIs foram posicionadas corretamente!\n\n✅ Posicionamento aprovado\n📊 Resultados de densitometria calculados',
        [{ text: 'Ver Resultados', onPress: () => setShowResults(true) }]
      );
    } else {
      Alert.alert(
        '📊 Análise do Posicionamento',
        `✅ Corretas: ${correctCount}/${regioes.length} ROIs\n\n💡 As ROIs com borda verde estão corretas.\n⚠️ As com borda vermelha precisam de ajuste.\n\nAjuste as posições e valide novamente.`,
        [{ text: 'Continuar Ajustando' }]
      );
    }
  };

  const handleSave = async () => {
    setShowSaveAnimation(true);
    
    Animated.sequence([
      Animated.spring(saveSuccessAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // SALVA o paciente com o exame completo
    const pacienteCompleto = {
      id,
      nome,
      idade,
      sexo,
      etnia,
      exame,
      vertebraSelecionada: selectedId,
      dataCriacao: new Date().toISOString(),
    };

    await salvarPaciente(pacienteCompleto);
    
    setTimeout(() => {
      saveSuccessAnim.setValue(0);
      setShowSaveAnimation(false);
      // Navega para a lista de exames após salvar
      navigation.navigate('Lista');
    }, 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.title}>GLOBAL ROI {exame}</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      {/* Info Box */}
      <Animated.View 
        style={[
          styles.infoBox,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <FontAwesome5 name="user" size={12} color="#4A90E2" />
          </View>
          <Text style={styles.infoLabel}>Paciente:</Text>
          <Text style={styles.infoValue}>{nome}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <FontAwesome5 name="birthday-cake" size={12} color="#4A90E2" />
          </View>
          <Text style={styles.infoLabel}>Idade:</Text>
          <Text style={styles.infoValue}>{idade}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <FontAwesome5 name="venus-mars" size={12} color="#4A90E2" />
          </View>
          <Text style={styles.infoLabel}>Sexo:</Text>
          <Text style={styles.infoValue}>{sexo}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <FontAwesome5 name="globe-americas" size={12} color="#4A90E2" />
          </View>
          <Text style={styles.infoLabel}>Etnia:</Text>
          <Text style={styles.infoValue}>{etnia}</Text>
        </View>
      </Animated.View>

      {/* Instructions */}
      {showInstructions && (
        <Animated.View 
          style={[
            styles.instructionsBox,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.instructionsHeader}>
            <FontAwesome5 name="info-circle" size={18} color="#4A90E2" />
            <Text style={styles.instructionsTitle}>Como Posicionar as ROIs</Text>
            <TouchableOpacity onPress={() => setShowInstructions(false)}>
              <FontAwesome5 name="times" size={18} color="#999" />
            </TouchableOpacity>
          </View>
          <Text style={styles.instructionsText}>{instrucoesPorExame[exame]}</Text>
    
        </Animated.View>
      )}

      {/* Image with Interactive ROIs */}
      <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
        <View style={styles.imageWrapper}>
          <Image 
            source={imagemExame[exame]} 
            style={[styles.image, { opacity: getImageStyle().imageOpacity }]} 
          />
          
          {/* Overlay de Brilho */}
          {getImageStyle().brightnessOverlay && (
            <View 
              style={[
                styles.imageOverlay,
                {
                  backgroundColor: getImageStyle().brightnessOverlay.color,
                  opacity: getImageStyle().brightnessOverlay.opacity,
                }
              ]} 
            />
          )}

          {/* Guias das posições corretas (sutis) */}
          {regioes.map((regiao) => (
            <View
              key={`guia-${regiao.id}`}
              style={[
                styles.roiGuide,
                {
                  left: regiao.correctX,
                  top: regiao.correctY,
                  width: regiao.width,
                  height: regiao.height,
                  transform: regiao.rotation ? [{ rotate: `${regiao.rotation}deg` }] : [],
                }
              ]}
            />
          ))}

          {/* ROIs Móveis */}
          {regioes.map((regiao) => {
            const position = roiPositions[regiao.id] || { x: 0, y: 0 };
            const isValidated = validatedROIs[regiao.id];
            const isSelected = selectedId === regiao.id;
            const panResponder = criarPanResponder(regiao.id);

            // Definir cor baseado no estado
            let borderColor = '#4A90E2'; // Azul padrão
            let backgroundColor = 'rgba(74, 144, 226, 0.1)';
            
            if (isValidated === true) {
              borderColor = '#4CAF50'; // Verde se correto
              backgroundColor = 'rgba(76, 175, 80, 0.15)';
            } else if (isValidated === false) {
              borderColor = '#FF6B6B'; // Vermelho se incorreto
              backgroundColor = 'rgba(255, 107, 107, 0.15)';
            }
            
            if (isSelected) {
              borderColor = '#FFD700'; // AMARELO quando selecionado (estilo scanner)
              backgroundColor = 'rgba(255, 215, 0, 0.25)';
            }

            return (
              <View
                key={regiao.id}
                {...panResponder.panHandlers}
                style={[
                  {
                    position: 'absolute',
                    left: position.x,
                    top: position.y,
                    width: regiao.width,
                    height: regiao.height,
                    borderColor,
                    backgroundColor,
                    borderWidth: isSelected ? 1 : 1,
                    borderStyle: 'solid',
                    borderRadius: 1,
                    transform: regiao.rotation ? [{ rotate: `${regiao.rotation}deg` }] : [],
                  }
                ]}
              >
                {/* Mostrar nome APENAS quando selecionado */}
                {isSelected && (
                  <View style={styles.roiLabelSelected}>
                    <Text style={styles.roiLabelTextSelected} numberOfLines={2}>
                      {regiao.name}
                    </Text>
                    {isValidated === true && (
                      <FontAwesome5 name="check-circle" size={12} color="#4CAF50" style={{ marginLeft: 4 }} />
                    )}
                    {isValidated === false && (
                      <FontAwesome5 name="times-circle" size={12} color="#FF6B6B" style={{ marginLeft: 4 }} />
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* Tabela de Resultados BMD - Estilo Prodigy */}
      {showResults && Object.keys(calculatedBMD).length > 0 && (
        <Animated.View style={[styles.resultsPanel, { opacity: fadeAnim }]}>
          <View style={styles.resultsPanelHeader}>
            <FontAwesome5 name="chart-bar" size={18} color="#4A90E2" />
            <Text style={styles.resultsPanelTitle}>Resultados da Densitometria</Text>
            <TouchableOpacity onPress={() => setShowResults(false)}>
              <FontAwesome5 name="times" size={18} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.resultsTable}>
            {/* Cabeçalho da Tabela */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Região</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>BMD{'\n'}(g/cm²)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>T-Score</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Z-Score</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Área{'\n'}(cm²)</Text>
            </View>

            {/* Linhas de Dados */}
            {regioes.map((regiao, index) => {
              const bmd = calculatedBMD[regiao.id];
              if (!bmd) return null;

              const isValidated = validatedROIs[regiao.id];
              const rowStyle = index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd;
              
              // Classificação do T-Score
              let tScoreColor = '#4CAF50'; // Normal
              let classification = 'Normal';
              const tScoreValue = parseFloat(bmd.tScore);
              
              if (tScoreValue < -2.5) {
                tScoreColor = '#F44336'; // Osteoporose
                classification = 'Osteoporose';
              } else if (tScoreValue < -1.0) {
                tScoreColor = '#FF9800'; // Osteopenia
                classification = 'Osteopenia';
              }

              return (
                <View key={regiao.id} style={[styles.tableRow, rowStyle]}>
                  <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                    {isValidated === true && (
                      <FontAwesome5 name="check-circle" size={12} color="#4CAF50" style={{ marginRight: 6 }} />
                    )}
                    {isValidated === false && (
                      <FontAwesome5 name="exclamation-circle" size={12} color="#FF6B6B" style={{ marginRight: 6 }} />
                    )}
                    <Text style={styles.tableCellText} numberOfLines={2}>{regiao.name}</Text>
                  </View>
                  <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>{bmd.bmd}</Text>
                  <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center', color: tScoreColor, fontWeight: '700' }]}>
                    {bmd.tScore}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>{bmd.zScore}</Text>
                  <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>{bmd.area}</Text>
                </View>
              );
            })}
          </View>

          {/* Legenda de Classificação */}
          <View style={styles.classificationLegend}>
            <Text style={styles.legendTitle}>Classificação WHO (T-Score):</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>≥ -1.0: Normal</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.legendText}>-1.0 a -2.5: Osteopenia</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
                <Text style={styles.legendText}>≤ -2.5: Osteoporose</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Image Controls - Brilho */}
      <Animated.View 
        style={[
          styles.imageControls,
          { opacity: fadeAnim }
        ]}
      >
        {/* Controle de Brilho */}
        <View style={styles.controlSection}>
          <View style={styles.sliderContainer}>
            <FontAwesome5 name="moon" size={16} color="#999" />
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={1.5}
              value={brightness}
              onValueChange={setBrightness}
              minimumTrackTintColor="#4A90E2"
              maximumTrackTintColor="#4a4a4a"
              thumbTintColor="#4A90E2"
            />
            <Text style={styles.controlValue}>{Math.round(brightness * 100)}%</Text>
          </View>
        </View>
      </Animated.View>

      {/* Controls */}
      <Animated.View 
        style={[
          styles.controls,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.button, styles.buttonValidate]}
          onPress={validarTodasROIs}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="check-double" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Validar Posições</Text>
        </TouchableOpacity>

        {Object.keys(calculatedBMD).length > 0 && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#667eea' }]}
            onPress={() => setShowResults(!showResults)}
            activeOpacity={0.8}
          >
            <FontAwesome5 name={showResults ? "eye-slash" : "chart-bar"} size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {showResults ? 'Ocultar Resultados' : 'Ver Resultados BMD'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="save" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Salvar Exame</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() =>
            navigation.navigate('Relatorio', {
              id,
              nome,
              idade,
              sexo,
              etnia,
              exame,
              vertebraSelecionada: selectedId,
            })
          }
          activeOpacity={0.8}
        >
          <FontAwesome5 name="file-alt" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Ver Relatório</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Save Success Animation */}
      {showSaveAnimation && (
        <View style={styles.saveOverlay}>
          <Animated.View
            style={[
              styles.saveCircle,
              {
                transform: [{ scale: saveSuccessAnim }],
                opacity: saveSuccessAnim,
              },
            ]}
          >
            <FontAwesome5 name="check" size={40} color="#FFFFFF" />
          </Animated.View>
          <Animated.Text
            style={[
              styles.saveText,
              {
                opacity: saveSuccessAnim,
              },
            ]}
          >
            Exame Salvo!
          </Animated.Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
  },
  scrollContent: {
    paddingBottom: 40,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  infoBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#2a3142',
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    minWidth: 70,
  },
  infoValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imageWrapper: {
    width: width - 40,
    height: height * 0.5,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'visible',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  instructionsBox: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#2a3142',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  instructionsText: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 10,
  },
  instructionsTip: {
    fontSize: 12,
    color: '#4A90E2',
    fontStyle: 'italic',
  },
  roiGuide: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    borderRadius: 4,
    pointerEvents: 'none',
  },
  roiRectangle: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roiTriangle: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roiLabelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  roiLabelSelected: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1d29',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120,
    maxWidth: 200,
  },
  roiLabelTextSelected: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  imageControls: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#2a3142',
    borderRadius: 12,
  },
  controlSection: {
    marginBottom: 16,
  },
  controlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  controlLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  controlValue: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '700',
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
    marginTop: 4,
  },
  resetButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  labelText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  controls: {
    paddingHorizontal: 20,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
  },
  buttonValidate: {
    backgroundColor: '#4CAF50',
  },
  buttonSecondary: {
    backgroundColor: '#667eea',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveOverlay: {
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
  saveCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  saveText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
  },
  // Estilos da Tabela de Resultados
  resultsPanel: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#2a3142',
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultsPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e2230',
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
    gap: 10,
  },
  resultsPanelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  resultsTable: {
    padding: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#1e2230',
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A90E2',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
  },
  tableRowOdd: {
    backgroundColor: 'transparent',
  },
  tableCellText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  classificationLegend: {
    padding: 16,
    backgroundColor: '#1e2230',
    borderTopWidth: 1,
    borderTopColor: '#3a4052',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#CCCCCC',
  },
});