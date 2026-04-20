import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography } from '../src/styles/theme';
import { useNavigation } from '@react-navigation/native';
import { salvarPaciente, atualizarPaciente } from '../utils/storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width, height } = Dimensions.get('window');

// Constantes para o editor
const EDITOR_WIDTH = Math.min(width - 40, 800);
const EDITOR_HEIGHT = height * 0.55;
const TOOLBAR_WIDTH = 50;

// Tamanho padrão dos ROIs (formato quadrado)
const DEFAULT_ROI_SIZE_PX = 80;

// Componente ROI simples (posicionado relativamente à imagem) - Arrastável e Redimensionável
const SimpleROI = ({ 
  region, 
  isSelected, 
  onSelect,
  isDraggable,
  isResizable,
  onPositionChange,
  onSizeChange,
  onInteractionStart,
  onInteractionEnd,
  containerSize,
  customSize, // { width, height } in px, per-ROI
}) => {
  const startPosRef = useRef({ x: region.x, y: region.y });
  const currentPosRef = useRef({ x: region.x, y: region.y });
  const [currentPos, setCurrentPos] = useState({ x: region.x, y: region.y });
  
  // Per-ROI size in pixels
  const roiWidth = customSize?.width || DEFAULT_ROI_SIZE_PX;
  const roiHeight = customSize?.height || DEFAULT_ROI_SIZE_PX;
  
  // Atualiza posição quando region muda externamente (reset)
  useEffect(() => {
    setCurrentPos({ x: region.x, y: region.y });
    currentPosRef.current = { x: region.x, y: region.y };
    startPosRef.current = { x: region.x, y: region.y };
  }, [region.x, region.y]);
  
  // PanResponder para mover o ROI
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  // Stable ref for current size — avoids recreating resizePanResponder on every size update
  const roiSizeRef = useRef({ w: roiWidth, h: roiHeight });
  roiSizeRef.current = { w: roiWidth, h: roiHeight };
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => isDraggable,
    onMoveShouldSetPanResponder: () => isDraggable,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: () => false,
    onPanResponderGrant: () => {
      if (onSelectRef.current) onSelectRef.current();
      if (onInteractionStart) onInteractionStart();
      startPosRef.current = { x: currentPosRef.current.x, y: currentPosRef.current.y };
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!containerSize.width || !containerSize.height) return;
      
      const deltaX = gestureState.dx / containerSize.width;
      const deltaY = gestureState.dy / containerSize.height;
      
      const scaledWidthRatio = roiSizeRef.current.w / containerSize.width;
      const scaledHeightRatio = roiSizeRef.current.h / containerSize.height;
      
      let newX = Math.max(0, Math.min(1 - scaledWidthRatio, startPosRef.current.x + deltaX));
      let newY = Math.max(0, Math.min(1 - scaledHeightRatio, startPosRef.current.y + deltaY));
      
      currentPosRef.current = { x: newX, y: newY };
      setCurrentPos({ x: newX, y: newY });
    },
    onPanResponderRelease: () => {
      if (onInteractionEnd) onInteractionEnd();
      if (onPositionChange) {
        onPositionChange(region.id, currentPosRef.current.x, currentPosRef.current.y);
      }
    },
  }), [isDraggable, containerSize, region.id, onPositionChange]);

  // PanResponder for resizing (bottom-right corner)
  const resizeStartRef = useRef({ w: roiWidth, h: roiHeight });
  const resizePanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => isResizable,
    onMoveShouldSetPanResponder: () => isResizable,
    onStartShouldSetPanResponderCapture: () => isResizable,
    onMoveShouldSetPanResponderCapture: () => isResizable,
    onPanResponderGrant: () => {
      if (onSelectRef.current) onSelectRef.current();
      if (onInteractionStart) onInteractionStart();
      // Snapshot current size at gesture start using ref (stable, no re-render dependency)
      resizeStartRef.current = { w: roiSizeRef.current.w, h: roiSizeRef.current.h };
    },
    onPanResponderMove: (evt, gestureState) => {
      const newW = Math.max(30, Math.min(300, resizeStartRef.current.w + gestureState.dx));
      const newH = Math.max(30, Math.min(300, resizeStartRef.current.h + gestureState.dy));
      if (onSizeChange) {
        onSizeChange(region.id, newW, newH);
      }
    },
    onPanResponderRelease: () => {
      if (onInteractionEnd) onInteractionEnd();
    },
  }), [isResizable, region.id, onSizeChange]);

  const roiStyle = {
    position: 'absolute',
    left: `${currentPos.x * 100}%`,
    top: `${currentPos.y * 100}%`,
    width: roiWidth,
    height: roiHeight,
    borderWidth: isSelected ? 2 : 1,
    borderColor: isSelected ? '#00E5FF' : 'rgba(0, 229, 255, 0.5)',
    backgroundColor: isSelected ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
    borderRadius: 2,
    cursor: isDraggable ? 'move' : 'pointer',
  };

  return (
    <View
      style={roiStyle}
      {...(isDraggable ? panResponder.panHandlers : {})}
    >
      <TouchableOpacity 
        style={{ flex: 1 }}
        onPress={onSelect}
        activeOpacity={0.8}
      >
        <View style={styles.regionLabel}>
          <Text style={styles.regionLabelText}>{region.id}</Text>
        </View>
        {isSelected && isDraggable && (
          <View style={styles.dragIndicator}>
            <FontAwesome5 name="arrows-alt" size={12} color="#00E5FF" />
          </View>
        )}
      </TouchableOpacity>
      {isResizable && (
        <View 
          style={styles.resizeHandle}
          {...resizePanResponder.panHandlers}
        >
          <FontAwesome5 name="expand-arrows-alt" size={12} color="#FFF" pointerEvents="none" />
        </View>
      )}
    </View>
  );
};

export default function ResultadoScreen({ route }) {
  const { 
    id, 
    nome, 
    idade,
    dataNascimento,
    peso,
    altura, 
    sexo, 
    etnia, 
    exame,
    operador,
    imagemCustomizada,
    imagemHash,
    brightness: initialBrightness = 100,
    contrast: initialContrast = 100,
    vertebraSelecionada: initialVertebra = null,
    roiData: initialRoiData = null,
    roiPositions: initialRoiPositions = {},
    roiScale: initialRoiScale = 1,
    roiSizes: initialRoiSizes = {},
  } = route.params;

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isNarrow = screenWidth < 600;
  const isMobile = Platform.OS !== 'web' || Math.min(screenWidth, screenHeight) < 500;
  const { theme } = useTheme();
  
  const [selectedId, setSelectedId] = useState(initialVertebra);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const navigation = useNavigation();

  // Estados das ferramentas de edição
  const [activeTool, setActiveTool] = useState('select');
  const [brightness, setBrightness] = useState(initialBrightness);
  const [contrast, setContrast] = useState(initialContrast);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [showROIPanel, setShowROIPanel] = useState(false);
  
  // Estados para pan e zoom manual
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  
  // Estado para posições customizadas dos ROIs e tamanhos individuais
  const [customRoiPositions, setCustomRoiPositions] = useState(initialRoiPositions);
  const [roiScale, setRoiScale] = useState(initialRoiScale); // Legacy global scale
  const [customRoiSizes, setCustomRoiSizes] = useState(initialRoiSizes);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [imageContainerSize, setImageContainerSize] = useState({ width: 0, height: 0 });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const saveSuccessAnim = useRef(new Animated.Value(0)).current;
  
  // PanResponder para mover a imagem
  const imagePanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => activeTool === 'pan',
    onMoveShouldSetPanResponder: () => activeTool === 'pan',
    onStartShouldSetPanResponderCapture: () => activeTool === 'pan',
    onMoveShouldSetPanResponderCapture: () => activeTool === 'pan',
    onPanResponderGrant: () => {
      // Salva a posição inicial ao começar a arrastar
    },
    onPanResponderMove: (evt, gestureState) => {
      const newX = panOffsetRef.current.x + gestureState.dx;
      const newY = panOffsetRef.current.y + gestureState.dy;
      setPanOffset({ x: newX, y: newY });
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Atualiza o ref com a nova posição final
      panOffsetRef.current = {
        x: panOffsetRef.current.x + gestureState.dx,
        y: panOffsetRef.current.y + gestureState.dy,
      };
    },
  }), [activeTool]);
  const imageZoomRef = useRef(null);

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

  // Lock to landscape on mobile
  useEffect(() => {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
        .catch(() => {});
      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
          .catch(() => {});
      };
    }
  }, []);

  // Usa imagem customizada se existir
  const imagemDoExame = imagemCustomizada 
    ? { uri: imagemCustomizada } 
    : null;

  // Regiões interativas por exame (baseadas na área da imagem)
  // Valores de referência baseados no Hologic Discovery QDR - NHANES III
  const regioesPorExame = {
    'Coluna Lombar': [
      { id: 'L1', x: 0.30, y: 0.08, width: 0.40, height: 0.18, bmd: 1.024, tScore: -0.8, zScore: 0.2, area: 10.89, bmc: 11.15 },
      { id: 'L2', x: 0.30, y: 0.28, width: 0.40, height: 0.18, bmd: 1.089, tScore: -0.5, zScore: 0.5, area: 12.54, bmc: 13.66 },
      { id: 'L3', x: 0.30, y: 0.48, width: 0.40, height: 0.18, bmd: 1.156, tScore: -0.2, zScore: 0.8, area: 13.87, bmc: 16.03 },
      { id: 'L4', x: 0.30, y: 0.68, width: 0.40, height: 0.18, bmd: 1.078, tScore: -0.6, zScore: 0.4, area: 15.22, bmc: 16.41 },
    ],
    'Fêmur': [
      { id: 'Neck', x: 0.25, y: 0.08, width: 0.50, height: 0.18, bmd: 0.856, tScore: -1.2, zScore: -0.3 },
      { id: 'Troch', x: 0.25, y: 0.28, width: 0.50, height: 0.20, bmd: 0.745, tScore: -1.5, zScore: -0.6 },
      { id: 'Inter', x: 0.25, y: 0.50, width: 0.50, height: 0.20, bmd: 1.023, tScore: -0.8, zScore: 0.1 },
      { id: 'Total', x: 0.25, y: 0.72, width: 0.50, height: 0.15, bmd: 0.912, tScore: -1.1, zScore: -0.2 },
    ],
    'Punho': [
      { id: 'UD', x: 0.25, y: 0.10, width: 0.50, height: 0.20, bmd: 0.456, tScore: -0.9, zScore: 0.1 },
      { id: 'MID', x: 0.25, y: 0.32, width: 0.50, height: 0.20, bmd: 0.678, tScore: -0.7, zScore: 0.3 },
      { id: '1/3', x: 0.25, y: 0.54, width: 0.50, height: 0.20, bmd: 0.789, tScore: -0.5, zScore: 0.5 },
      { id: 'Total', x: 0.25, y: 0.76, width: 0.50, height: 0.15, bmd: 0.634, tScore: -0.7, zScore: 0.3 },
    ],
    'Corpo Total': [
      { id: 'Cabeça', x: 0.35, y: 0.02, width: 0.30, height: 0.10, bmd: 2.124, tScore: 0.5, zScore: 0.8 },
      { id: 'Tronco', x: 0.25, y: 0.14, width: 0.50, height: 0.25, bmd: 0.978, tScore: -0.5, zScore: 0.2 },
      { id: 'Braço E', x: 0.08, y: 0.14, width: 0.15, height: 0.25, bmd: 0.756, tScore: -1.0, zScore: -0.2 },
      { id: 'Braço D', x: 0.77, y: 0.14, width: 0.15, height: 0.25, bmd: 0.762, tScore: -0.9, zScore: -0.1 },
      { id: 'Pelve', x: 0.25, y: 0.41, width: 0.50, height: 0.12, bmd: 1.089, tScore: -0.3, zScore: 0.4 },
      { id: 'Perna E', x: 0.18, y: 0.55, width: 0.25, height: 0.40, bmd: 1.234, tScore: 0.2, zScore: 0.6 },
      { id: 'Perna D', x: 0.57, y: 0.55, width: 0.25, height: 0.40, bmd: 1.245, tScore: 0.3, zScore: 0.7 },
    ],
  };

  const regioes = regioesPorExame[exame] || [];
  
  // Função para calcular BMD e scores baseados na posição do ROI
  // Simulação: quanto mais ao centro, melhor o score
  const calcularScoresPorPosicao = (x, y, baseRegion) => {
    // Centro ideal seria em torno de x=0.30, y varia por região
    const centerX = 0.30;
    const distanciaDocentro = Math.abs(x - centerX);
    
    // Variação do BMD baseada na distância do centro (simulação)
    const variacao = (distanciaDocentro * 0.3) - 0.15;
    const novoBmd = Math.max(0.1, baseRegion.bmd + variacao).toFixed(3);
    
    // Recalcula T-Score e Z-Score baseado no novo BMD
    // Fórmula simplificada: T-Score varia inversamente com distância
    const novoTScore = (baseRegion.tScore - (distanciaDocentro * 2) + Math.random() * 0.2 - 0.1).toFixed(1);
    const novoZScore = (baseRegion.zScore - (distanciaDocentro * 1.5) + Math.random() * 0.2 - 0.1).toFixed(1);
    
    return {
      bmd: parseFloat(novoBmd),
      tScore: parseFloat(novoTScore),
      zScore: parseFloat(novoZScore),
    };
  };
  
  // Mescla regiões com posições e scores customizados
  const regioesComPosicoes = regioes.map(r => {
    const customPos = customRoiPositions[r.id];
    let result = { ...r };
    
    if (customPos) {
      const novosScores = calcularScoresPorPosicao(customPos.x, customPos.y, r);
      result = {
        ...result,
        x: customPos.x,
        y: customPos.y,
        ...novosScores,
      };
    }
    
    return result;
  });
  
  const regiaoSelecionada = regioesComPosicoes.find((r) => r.id === selectedId);
  
  // Handler para atualizar posição do ROI
  const handleRoiPositionChange = (roiId, newX, newY) => {
    setCustomRoiPositions(prev => ({
      ...prev,
      [roiId]: { x: newX, y: newY },
    }));
  };

  // Handler para atualizar tamanho individual do ROI
  const handleRoiSizeChange = useCallback((roiId, newWidth, newHeight) => {
    setCustomRoiSizes(prev => ({
      ...prev,
      [roiId]: { width: Math.round(newWidth), height: Math.round(newHeight) },
    }));
  }, []);

  // Ferramentas disponíveis
  const tools = [
    { id: 'select', icon: 'mouse-pointer', label: 'Selecionar' },
    { id: 'pan', icon: 'hand-paper', label: 'Mover' },
    { id: 'zoom-in', icon: 'search-plus', label: 'Zoom +' },
    { id: 'zoom-out', icon: 'search-minus', label: 'Zoom -' },
    { id: 'roi', icon: 'vector-square', label: 'ROI' },
    { id: 'contrast', icon: 'adjust', label: 'Ajustes' },
    { id: 'reset', icon: 'undo', label: 'Resetar' },
  ];

  const handleToolPress = (toolId) => {
    if (toolId === 'zoom-in') {
      setZoomLevel(prev => Math.min(prev + 0.25, 3));
      return;
    }
    if (toolId === 'zoom-out') {
      setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
      return;
    }
    if (toolId === 'reset') {
      setBrightness(100);
      setContrast(100);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      panOffsetRef.current = { x: 0, y: 0 };
      setSelectedId(null);
      setCustomRoiPositions({});
      setRoiScale(1);
      setCustomRoiSizes({});
      setShowAdjustments(false);
      setShowROIPanel(false);
      return;
    }
    if (toolId === 'contrast') {
      setShowAdjustments(!showAdjustments);
      setShowROIPanel(false);
      setActiveTool(toolId);
      return;
    }
    if (toolId === 'roi') {
      setShowROIPanel(!showROIPanel);
      setShowAdjustments(false);
      setActiveTool(toolId);
      return;
    }
    setActiveTool(toolId);
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

    const pacienteCompleto = {
      id,
      nome,
      idade,
      dataNascimento,
      peso,
      altura,
      sexo,
      etnia,
      exame,
      operador,
      imagemCustomizada,
      imagemHash,
      vertebraSelecionada: selectedId,
      brightness,
      contrast,
      zoomLevel,
      roiData: regiaoSelecionada,
      roiPositions: customRoiPositions,
      roiScale: roiScale,
      roiSizes: customRoiSizes,
      allRoiData: regioesComPosicoes,
      dataCriacao: route.params.dataCriacao || new Date().toISOString(),
    };

    // Se vier de uma edição (tem dataCriacao nos params), atualiza. Senão, salva novo.
    if (route.params.dataCriacao) {
      await atualizarPaciente(pacienteCompleto);
    } else {
      await salvarPaciente(pacienteCompleto);
    }
    
    setTimeout(() => {
      saveSuccessAnim.setValue(0);
      setShowSaveAnimation(false);
      navigation.navigate('Lista');
    }, 1500);
  };

  const getStatusFromTScore = (tScore) => {
    if (tScore >= -1) return { status: 'Normal', color: '#4CAF50' };
    if (tScore >= -2.5) return { status: 'Osteopenia', color: '#FFC107' };
    if (tScore >= -3.5) return { status: 'Osteoporose', color: '#F44336' };
    return { status: 'Osteoporose Severa', color: '#B71C1C' };
  };

  const getImageStyle = () => {
    const brightnessValue = brightness / 100;
    const contrastValue = contrast / 100;
    
    return {
      resizeMode: 'contain',
      opacity: brightnessValue,
      ...(Platform.OS === 'web' && {
        filter: `brightness(${brightnessValue}) contrast(${contrastValue})`,
      }),
    };
  };

  return (
    <View style={{flex: 1, backgroundColor: theme.editorBg}}>
    <ScrollView scrollEnabled={scrollEnabled} style={[styles.container, { backgroundColor: theme.editorBg }]} contentContainerStyle={[styles.scrollContent, (isNarrow || isMobile) && { paddingBottom: 70 }]}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { backgroundColor: theme.editorSurface, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.editorPanel }]} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={18} color="#4A90E2" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>DXA ANALYSIS</Text>
          <Text style={[styles.title, { color: theme.text }]}>{exame}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={[styles.statusText, { color: theme.textMuted }]}>Online</Text>
          </View>
        </View>
      </Animated.View>

      {/* Patient Info Bar */}
      <Animated.View style={[styles.patientBar, { backgroundColor: theme.editorSurface, borderColor: theme.editorBorder, opacity: fadeAnim }]}>
        <View style={styles.patientInfo}>
          <FontAwesome5 name="user" size={12} color="#4A90E2" />
          <Text style={[styles.patientText, { color: theme.editorText }]}>{nome}</Text>
        </View>
        <View style={[styles.patientDivider, { backgroundColor: theme.editorBorder }]} />
        <View style={styles.patientInfo}>
          <FontAwesome5 name="birthday-cake" size={12} color="#4A90E2" />
          <Text style={[styles.patientText, { color: theme.editorText }]}>{idade} anos</Text>
        </View>
        <View style={[styles.patientDivider, { backgroundColor: theme.editorBorder }]} />
        <View style={styles.patientInfo}>
          <FontAwesome5 name="venus-mars" size={12} color="#4A90E2" />
          <Text style={[styles.patientText, { color: theme.editorText }]}>{sexo}</Text>
        </View>
        <View style={[styles.patientDivider, { backgroundColor: theme.editorBorder }]} />
        <View style={styles.patientInfo}>
          <FontAwesome5 name="globe-americas" size={12} color="#4A90E2" />
          <Text style={[styles.patientText, { color: theme.editorText }]}>{etnia}</Text>
        </View>
      </Animated.View>

      {/* Main Editor Area */}
      <Animated.View style={[styles.editorContainer, { backgroundColor: theme.editorSurface, opacity: fadeAnim }, isNarrow && styles.editorContainerMobile]}>
        {/* Toolbar */}
        {!(isNarrow || isMobile) && (
        <View style={[styles.toolbar, { backgroundColor: theme.editorPanel, borderColor: theme.editorBorder }, isNarrow && styles.toolbarMobile]}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolButton, activeTool === tool.id && styles.toolButtonActive]}
              onPress={() => handleToolPress(tool.id)}
            >
              <FontAwesome5 name={tool.icon} size={16} color={activeTool === tool.id ? '#FFFFFF' : '#8892B0'} />
            </TouchableOpacity>
          ))}
          <View style={styles.zoomIndicator}>
            <Text style={[styles.zoomText, { color: theme.textMuted }]}>{Math.round(zoomLevel * 100)}%</Text>
          </View>
        </View>
        )}

        {/* Image Canvas */}
        <View style={styles.canvasContainer}>
          <View style={styles.rulerTop}>
            {[...Array(10)].map((_, i) => (
              <View key={i} style={styles.rulerMark}>
                <Text style={styles.rulerText}>{i * 10}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.imageArea}>
            <View style={styles.rulerLeft}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={styles.rulerMarkVertical}>
                  <Text style={styles.rulerText}>{i * 10}</Text>
                </View>
              ))}
            </View>

            <View 
              style={styles.imageCanvas}
              {...imagePanResponder.panHandlers}
            >
              {/* Container da imagem com pan e zoom */}
              <View 
                style={[
                  styles.imageContainer, 
                  { 
                    transform: [
                      { translateX: panOffset.x },
                      { translateY: panOffset.y },
                      { scale: zoomLevel },
                    ] 
                  }
                ]}
                onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  setImageContainerSize({ width, height });
                }}
              >
                {/* Imagem centralizada */}
                {imagemDoExame ? (
                  <Image 
                    source={imagemDoExame} 
                    style={[styles.mainImage, getImageStyle()]} 
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.noImageContainer}>
                    <FontAwesome5 name="image" size={48} color="#4A5568" />
                    <Text style={styles.noImageText}>Imagem indisponível</Text>
                    <Text style={styles.noImageSubtext}>Nenhuma imagem foi adicionada para este exame</Text>
                  </View>
                )}
                
                {/* ROIs sobrepostos na imagem */}
                {regioesComPosicoes.map((r) => (
                  <SimpleROI
                    key={r.id}
                    region={r}
                    isSelected={selectedId === r.id}
                    onSelect={() => setSelectedId(r.id)}
                    isDraggable={activeTool === 'select'}
                    isResizable={activeTool === 'roi'}
                    onPositionChange={handleRoiPositionChange}
                    onSizeChange={handleRoiSizeChange}
                    onInteractionStart={() => setScrollEnabled(false)}
                    onInteractionEnd={() => setScrollEnabled(true)}
                    containerSize={imageContainerSize}
                    customSize={customRoiSizes[r.id] || { width: DEFAULT_ROI_SIZE_PX * roiScale, height: DEFAULT_ROI_SIZE_PX * roiScale }}
                  />
                ))}
              </View>
              
              {/* Indicador de ferramenta ativa */}
              {activeTool === 'pan' && (
                <View style={styles.toolIndicator} pointerEvents="none">
                  <FontAwesome5 name="hand-paper" size={16} color="rgba(74, 144, 226, 0.5)" />
                </View>
              )}
            </View>
          </View>

          <View style={styles.canvasInfoBar}>
            <Text style={styles.canvasInfoText}>
              <FontAwesome5 name="crosshairs" size={10} color="#4A90E2" /> ROI: {selectedId || 'Nenhuma'}
            </Text>
            <Text style={styles.canvasInfoText}>
              <FontAwesome5 name="search" size={10} color="#4A90E2" /> Zoom: {Math.round(zoomLevel * 100)}%
            </Text>
            <Text style={styles.canvasInfoText}>
              <FontAwesome5 name="sun" size={10} color="#4A90E2" /> Brilho: {brightness}%
            </Text>
            <Text style={styles.canvasInfoText}>
              <FontAwesome5 name="adjust" size={10} color="#4A90E2" /> Contraste: {contrast}%
            </Text>
            {activeTool === 'pan' && (
              <Text style={[styles.canvasInfoText, { color: '#00E5FF' }]}>
                <FontAwesome5 name="hand-paper" size={10} color="#00E5FF" /> Arraste para mover
              </Text>
            )}
            {activeTool === 'select' && selectedId && (
              <Text style={[styles.canvasInfoText, { color: '#00E5FF' }]}>
                <FontAwesome5 name="arrows-alt" size={10} color="#00E5FF" /> Arraste o ROI para reposicionar
              </Text>
            )}
            {activeTool === 'select' && !selectedId && (
              <Text style={[styles.canvasInfoText, { color: '#FFD700' }]}>
                <FontAwesome5 name="mouse-pointer" size={10} color="#FFD700" /> Clique em um ROI para selecionar
              </Text>
            )}
          </View>
        </View>

        {/* Side Panel */}
        <View style={[styles.sidePanel, { backgroundColor: theme.editorPanel, borderColor: theme.editorBorder }, isNarrow && styles.sidePanelMobile]}>
          {showAdjustments && (
            <View style={[styles.adjustmentPanel, { backgroundColor: theme.editorPanel }]}>
              <Text style={[styles.panelTitle, { color: theme.editorText }]}>
                <FontAwesome5 name="sliders-h" size={12} color="#4A90E2" /> Ajustes de Imagem
              </Text>
              
              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <FontAwesome5 name="sun" size={12} color="#FFD700" />
                  <Text style={[styles.sliderLabel, { color: theme.editorText }]}>Brilho</Text>
                  <Text style={[styles.sliderValue, { color: theme.textMuted }]}>{brightness}%</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={200}
                  value={brightness}
                  onValueChange={setBrightness}
                  minimumTrackTintColor="#4A90E2"
                  maximumTrackTintColor="#3d4454"
                  thumbTintColor="#4A90E2"
                />
              </View>

              <View style={styles.sliderContainer}>
                <View style={styles.sliderHeader}>
                  <FontAwesome5 name="adjust" size={12} color="#4A90E2" />
                  <Text style={[styles.sliderLabel, { color: theme.editorText }]}>Contraste</Text>
                  <Text style={[styles.sliderValue, { color: theme.textMuted }]}>{contrast}%</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={200}
                  value={contrast}
                  onValueChange={setContrast}
                  minimumTrackTintColor="#4A90E2"
                  maximumTrackTintColor="#3d4454"
                  thumbTintColor="#4A90E2"
                />
              </View>

              <TouchableOpacity style={styles.resetButton} onPress={() => { setBrightness(100); setContrast(100); }}>
                <FontAwesome5 name="undo" size={12} color="#FFF" />
                <Text style={styles.resetButtonText}>Resetar</Text>
              </TouchableOpacity>
            </View>
          )}

          {(showROIPanel || regiaoSelecionada) && (
            <View style={[styles.roiPanel, { backgroundColor: theme.editorPanel }]}>
              <Text style={[styles.panelTitle, { color: theme.editorText }]}>
                <FontAwesome5 name="chart-bar" size={12} color="#4A90E2" /> Análise de ROI
              </Text>
              
              {regiaoSelecionada ? (
                <View style={styles.roiData}>
                  <View style={styles.roiHeader}>
                    <Text style={[styles.roiRegionName, { color: theme.text }]}>{regiaoSelecionada.id}</Text>
                    <View style={[styles.roiStatusBadge, { backgroundColor: getStatusFromTScore(regiaoSelecionada.tScore).color }]}>
                      <Text style={styles.roiStatusText}>{getStatusFromTScore(regiaoSelecionada.tScore).status}</Text>
                    </View>
                  </View>

                  <View style={styles.roiMetrics}>
                    <View style={styles.roiMetricItem}>
                      <Text style={[styles.roiMetricLabel, { color: theme.textMuted }]}>BMD</Text>
                      <Text style={[styles.roiMetricValue, { color: theme.text }]}>{regiaoSelecionada.bmd.toFixed(3)}</Text>
                      <Text style={[styles.roiMetricUnit, { color: theme.textMuted }]}>g/cm²</Text>
                    </View>
                    <View style={styles.roiMetricItem}>
                      <Text style={[styles.roiMetricLabel, { color: theme.textMuted }]}>T-Score</Text>
                      <Text style={[styles.roiMetricValue, { color: getStatusFromTScore(regiaoSelecionada.tScore).color }]}>
                        {regiaoSelecionada.tScore.toFixed(1)}
                      </Text>
                      <Text style={[styles.roiMetricUnit, { color: theme.textMuted }]}>SD</Text>
                    </View>
                    <View style={styles.roiMetricItem}>
                      <Text style={[styles.roiMetricLabel, { color: theme.textMuted }]}>Z-Score</Text>
                      <Text style={[styles.roiMetricValue, { color: theme.text }]}>{regiaoSelecionada.zScore.toFixed(1)}</Text>
                      <Text style={[styles.roiMetricUnit, { color: theme.textMuted }]}>SD</Text>
                    </View>
                  </View>

                  {/* Area and BMC - Hologic QDR format */}
                  {(regiaoSelecionada.area || regiaoSelecionada.bmc) && (
                    <View style={styles.roiMetrics}>
                      {regiaoSelecionada.area != null && (
                        <View style={styles.roiMetricItem}>
                          <Text style={styles.roiMetricLabel}>Area</Text>
                          <Text style={styles.roiMetricValue}>{regiaoSelecionada.area.toFixed(2)}</Text>
                          <Text style={styles.roiMetricUnit}>cm²</Text>
                        </View>
                      )}
                      {regiaoSelecionada.bmc != null && (
                        <View style={styles.roiMetricItem}>
                          <Text style={styles.roiMetricLabel}>BMC</Text>
                          <Text style={styles.roiMetricValue}>{regiaoSelecionada.bmc.toFixed(2)}</Text>
                          <Text style={styles.roiMetricUnit}>g</Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.tScoreBar}>
                    <View style={styles.tScoreBarBg}>
                      <View style={[styles.tScoreZone, { backgroundColor: '#4CAF50', flex: 1 }]} />
                      <View style={[styles.tScoreZone, { backgroundColor: '#FFC107', flex: 1.5 }]} />
                      <View style={[styles.tScoreZone, { backgroundColor: '#F44336', flex: 1 }]} />
                    </View>
                    <View style={[styles.tScoreMarker, { left: `${Math.max(0, Math.min(100, ((regiaoSelecionada.tScore + 4) / 5) * 100))}%` }]} />
                    <View style={styles.tScoreLabels}>
                      <Text style={styles.tScoreLabel}>-4</Text>
                      <Text style={styles.tScoreLabel}>-2.5</Text>
                      <Text style={styles.tScoreLabel}>-1</Text>
                      <Text style={styles.tScoreLabel}>+1</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.roiEmpty}>
                  <FontAwesome5 name="hand-pointer" size={24} color="#4A90E2" />
                  <Text style={[styles.roiEmptyText, { color: theme.textMuted }]}>Selecione uma região na imagem</Text>
                </View>
              )}
            </View>
          )}

          <View style={[styles.regionsPanel, { backgroundColor: theme.editorPanel }]}>
            <Text style={[styles.panelTitle, { color: theme.editorText }]}>
              <FontAwesome5 name="layer-group" size={12} color="#4A90E2" /> Regiões
            </Text>
            
            {/* Controle de tamanho dos ROIs */}
            <View style={styles.roiSizeControl}>
              <View style={styles.roiSizeHeader}>
                <FontAwesome5 name="expand" size={10} color="#8892B0" />
                <Text style={[styles.roiSizeLabel, { color: theme.textMuted }]}>Tamanho ROI</Text>
                <Text style={[styles.roiSizeValue, { color: theme.textMuted }]}>{Math.round(roiScale * 100)}%</Text>
              </View>
              <View style={styles.roiSizeButtons}>
                <TouchableOpacity 
                  style={styles.roiSizeBtn}
                  onPress={() => setRoiScale(prev => Math.max(0.2, prev - 0.1))}
                >
                  <FontAwesome5 name="minus" size={10} color="#fff" />
                </TouchableOpacity>
                <View style={styles.roiSizeBarContainer}>
                  <View style={[styles.roiSizeBar, { width: `${((roiScale - 0.2) / 1.3) * 100}%` }]} />
                </View>
                <TouchableOpacity 
                  style={styles.roiSizeBtn}
                  onPress={() => setRoiScale(prev => Math.min(1.5, prev + 0.1))}
                >
                  <FontAwesome5 name="plus" size={10} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={styles.regionsList} nestedScrollEnabled>
              {regioes.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.regionItem, selectedId === r.id && styles.regionItemActive]}
                  onPress={() => setSelectedId(r.id)}
                >
                  <View style={[styles.regionDot, { backgroundColor: getStatusFromTScore(r.tScore).color }]} />
                  <Text style={[styles.regionItemText, { color: theme.editorText }, selectedId === r.id && styles.regionItemTextActive]}>{r.id}</Text>
                  <Text style={[styles.regionItemValue, { color: theme.textMuted }]}>{r.tScore.toFixed(1)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View style={[styles.controls, { opacity: fadeAnim }]}>
        <TouchableOpacity style={[styles.button, styles.buttonFullWidth]} onPress={handleSave} activeOpacity={0.8}>
          <FontAwesome5 name="save" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Salvar Exame</Text>
        </TouchableOpacity>
      </Animated.View>

      {showSaveAnimation && (
        <View style={styles.saveOverlay}>
          <Animated.View style={[styles.saveCircle, { transform: [{ scale: saveSuccessAnim }], opacity: saveSuccessAnim }]}>
            <FontAwesome5 name="check" size={40} color="#FFFFFF" />
          </Animated.View>
          <Animated.Text style={[styles.saveText, { opacity: saveSuccessAnim }]}>Exame Salvo!</Animated.Text>
        </View>
      )}
    </ScrollView>

    {/* Fixed Toolbar - Mobile */}
    {(isNarrow || isMobile) && (
      <View style={styles.fixedToolbar}>
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[styles.fixedToolBtn, activeTool === tool.id && styles.fixedToolBtnActive]}
            onPress={() => handleToolPress(tool.id)}
          >
            <FontAwesome5 name={tool.icon} size={16} color={activeTool === tool.id ? '#FFFFFF' : '#8892B0'} />
          </TouchableOpacity>
        ))}
        <Text style={styles.fixedZoomText}>{Math.round(zoomLevel * 100)}%</Text>
      </View>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  scrollContent: { paddingBottom: 40 },
  fixedToolbar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 27, 34, 0.97)',
    borderTopWidth: 1,
    borderTopColor: '#30363d',
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  fixedToolBtn: {
    flex: 1,
    maxWidth: 48,
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 54, 61, 0.6)',
    marginHorizontal: 2,
  },
  fixedToolBtnActive: {
    backgroundColor: '#4A90E2',
  },
  fixedZoomText: {
    color: '#8892B0',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    minWidth: 36,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#21262d',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerSubtitle: { fontSize: 10, fontWeight: '600', color: '#4A90E2', letterSpacing: 2 },
  title: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  headerRight: { width: 80, alignItems: 'flex-end' },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, color: '#8892B0' },
  patientBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    flexWrap: 'wrap',
    gap: 8,
  },
  patientInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  patientText: { fontSize: 12, color: '#c9d1d9', fontWeight: '500' },
  patientDivider: { width: 1, height: 14, backgroundColor: '#30363d' },
  editorContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: '#161b22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    overflow: 'hidden',
    minHeight: EDITOR_HEIGHT + 80,
  },
  toolbar: {
    width: TOOLBAR_WIDTH,
    backgroundColor: '#21262d',
    paddingVertical: 8,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#30363d',
  },
  toolButton: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginVertical: 3 },
  toolButtonActive: { backgroundColor: '#4A90E2' },
  zoomIndicator: { marginTop: 'auto', paddingVertical: 8, paddingHorizontal: 4, backgroundColor: '#30363d', borderRadius: 6 },
  zoomText: { fontSize: 9, color: '#8892B0', fontWeight: '600' },
  canvasContainer: { flex: 1, backgroundColor: '#0d1117' },
  rulerTop: {
    height: 20,
    backgroundColor: '#21262d',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  rulerMark: { flex: 1, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#30363d', paddingBottom: 2 },
  rulerText: { fontSize: 8, color: '#6e7681' },
  imageArea: { flex: 1, flexDirection: 'row' },
  rulerLeft: { width: 20, backgroundColor: '#21262d', borderRightWidth: 1, borderRightColor: '#30363d' },
  rulerMarkVertical: { flex: 1, justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#30363d' },
  imageCanvas: { 
    flex: 1, 
    backgroundColor: '#0a0a0a', 
    position: 'relative', 
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '85%',
    height: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#30363d',
    borderStyle: 'dashed',
  },
  noImageText: {
    color: '#8892B0',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  noImageSubtext: {
    color: '#4A5568',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  toolIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  regionLabel: { 
    position: 'absolute', 
    top: 2, 
    left: 2, 
    backgroundColor: 'rgba(0, 229, 255, 0.9)', 
    paddingHorizontal: 4, 
    paddingVertical: 1, 
    borderRadius: 2,
  },
  regionLabelText: { color: '#000', fontSize: 8, fontWeight: '700' },
  dragIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 3,
    borderRadius: 3,
  },
  resizeHandle: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 28,
    height: 28,
    backgroundColor: '#4A90E2',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    cursor: 'nwse-resize',
    zIndex: 10,
  },
  canvasInfoBar: {
    height: 28,
    backgroundColor: '#21262d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  canvasInfoText: { fontSize: 10, color: '#8892B0' },
  sidePanel: { width: 200, backgroundColor: '#21262d', borderLeftWidth: 1, borderLeftColor: '#30363d' },
  adjustmentPanel: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#30363d' },
  panelTitle: { fontSize: 11, fontWeight: '700', color: '#c9d1d9', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  sliderContainer: { marginBottom: 16 },
  sliderHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  sliderLabel: { fontSize: 11, color: '#8892B0', flex: 1 },
  sliderValue: { fontSize: 11, color: '#4A90E2', fontWeight: '600' },
  slider: { width: '100%', height: 24 },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#30363d', paddingVertical: 8, borderRadius: 6 },
  resetButtonText: { fontSize: 11, color: '#c9d1d9', fontWeight: '600' },
  roiPanel: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#30363d' },
  roiData: { gap: 12 },
  roiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roiRegionName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  roiStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  roiStatusText: { fontSize: 9, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' },
  roiMetrics: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  roiMetricItem: { flex: 1, backgroundColor: '#0d1117', padding: 8, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#30363d' },
  roiMetricLabel: { fontSize: 9, color: '#8892B0', marginBottom: 4 },
  roiMetricValue: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  roiMetricUnit: { fontSize: 8, color: '#6e7681', marginTop: 2 },
  tScoreBar: { marginTop: 8 },
  tScoreBarBg: { height: 8, flexDirection: 'row', borderRadius: 4, overflow: 'hidden' },
  tScoreZone: { height: '100%' },
  tScoreMarker: { position: 'absolute', top: -2, width: 4, height: 12, backgroundColor: '#FFFFFF', borderRadius: 2, marginLeft: -2 },
  tScoreLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  tScoreLabel: { fontSize: 8, color: '#6e7681' },
  roiEmpty: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  roiEmptyText: { fontSize: 11, color: '#8892B0', textAlign: 'center' },
  regionsPanel: { padding: 12, flex: 1 },
  roiSizeControl: {
    backgroundColor: '#0d1117',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  roiSizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  roiSizeLabel: {
    flex: 1,
    fontSize: 10,
    color: '#8892B0',
    textTransform: 'uppercase',
  },
  roiSizeValue: {
    fontSize: 10,
    color: '#00E5FF',
    fontWeight: '600',
  },
  roiSizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roiSizeBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roiSizeBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#30363d',
    borderRadius: 3,
    overflow: 'hidden',
  },
  roiSizeBar: {
    height: '100%',
    backgroundColor: '#00E5FF',
    borderRadius: 3,
  },
  regionsList: { flex: 1 },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  regionItemActive: { backgroundColor: 'rgba(74, 144, 226, 0.15)', borderColor: '#4A90E2' },
  regionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  regionItemText: { flex: 1, fontSize: 12, color: '#8892B0', fontWeight: '500' },
  regionItemTextActive: { color: '#FFFFFF' },
  regionItemValue: { fontSize: 11, color: '#6e7681', fontWeight: '600' },
  controls: { paddingHorizontal: 12, paddingTop: 16, flexDirection: 'row', gap: 12 },
  button: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4A90E2', borderRadius: 10, paddingVertical: 14, gap: 10 },
  buttonFullWidth: { flex: 1 },
  buttonSecondary: { backgroundColor: '#238636' },
  buttonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  saveOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(13, 17, 23, 0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  saveCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#238636', justifyContent: 'center', alignItems: 'center' },
  saveText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginTop: 20 },
  editorContainerMobile: {
    flexDirection: 'column',
    minHeight: 'auto',
  },
  toolbarMobile: {
    flexDirection: 'row',
    width: '100%',
    height: TOOLBAR_WIDTH,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    paddingVertical: 0,
    paddingHorizontal: 8,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  sidePanelMobile: {
    width: '100%',
    maxHeight: 400,
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
});
