import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Função auxiliar para manipular a meta tag no DOM
 */
const setMetaThemeColorInDOM = (color: string) => {
  if (Platform.OS !== 'web') return;
  
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', color);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = color;
    document.head.appendChild(meta);
  }
};

/**
 * Configura as cores globais do navegador (background do body e theme-color padrão).
 * Deve ser usado no topo da árvore de componentes (em _layout.tsx).
 */
export function WebThemeConfig() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Calcula a cor final baseada no tema
  const themeColor = isDark ? Colors.dark.background : Colors.light.background;

  // Efeito para aplicar a cor no DOM sempre que ela mudar
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // 1. Atualiza a meta tag theme-color
    setMetaThemeColorInDOM(themeColor);

    // 2. Atualiza o background do body
    document.body.style.backgroundColor = themeColor;
    
    // Adiciona transição suave para mudanças de tema
    document.body.style.transition = 'background-color 0.4s ease';

  }, [themeColor]);

  return null;
}
