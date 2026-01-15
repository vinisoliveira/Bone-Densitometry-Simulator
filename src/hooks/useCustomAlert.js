import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar o estado do CustomAlert
 * 
 * Uso:
 * const { alertConfig, showAlert, hideAlert } = useCustomAlert();
 * 
 * showAlert({
 *   title: 'Título',
 *   message: 'Mensagem',
 *   type: 'success', // 'info' | 'success' | 'warning' | 'error'
 *   buttons: [
 *     { text: 'Cancelar', style: 'cancel' },
 *     { text: 'OK', onPress: () => console.log('OK'), style: 'default' },
 *   ]
 * });
 */
export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [{ text: 'OK' }],
  });

  const showAlert = useCallback(({ title, message, type = 'info', buttons }) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons: buttons || [{ text: 'OK' }],
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    alertConfig,
    showAlert,
    hideAlert,
  };
}
