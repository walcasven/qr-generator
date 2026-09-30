// Plantillas visuales predefinidas para aplicar estilos profesionales en 1 solo clic
const QR_PRESETS = [
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    description: 'Tonos cian y azul eléctrico de alta energía',
    previewBg: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    config: {
      dotsType: 'dots',
      useGradient: true,
      gradientType: 'linear',
      gradientColor1: '#00c6ff',
      gradientColor2: '#0072ff',
      gradientAngle: 45,
      cornersSquareType: 'extra-rounded',
      cornersSquareColor: '#0072ff',
      cornersDotType: 'dot',
      cornersDotColor: '#00c6ff',
      bgColor: '#ffffff'
    }
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Degradado cálido magenta y naranja coral',
    previewBg: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    config: {
      dotsType: 'classy-rounded',
      useGradient: true,
      gradientType: 'linear',
      gradientColor1: '#f43f5e',
      gradientColor2: '#fb923c',
      gradientAngle: 45,
      cornersSquareType: 'extra-rounded',
      cornersSquareColor: '#f43f5e',
      cornersDotType: 'dot',
      cornersDotColor: '#fb923c',
      bgColor: '#ffffff'
    }
  },
  {
    id: 'emerald-mint',
    name: 'Esmeralda',
    description: 'Verde orgánico y fresco para marcas modernas',
    previewBg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    config: {
      dotsType: 'rounded',
      useGradient: true,
      gradientType: 'linear',
      gradientColor1: '#047857',
      gradientColor2: '#10b981',
      gradientAngle: 45,
      cornersSquareType: 'extra-rounded',
      cornersSquareColor: '#047857',
      cornersDotType: 'dot',
      cornersDotColor: '#10b981',
      bgColor: '#ffffff'
    }
  },
  {
    id: 'royal-violet',
    name: 'Royal Violet',
    description: 'Púrpura y lavanda para un aspecto lujoso y creativo',
    previewBg: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    config: {
      dotsType: 'dots',
      useGradient: true,
      gradientType: 'linear',
      gradientColor1: '#4f46e5',
      gradientColor2: '#9333ea',
      gradientAngle: 45,
      cornersSquareType: 'extra-rounded',
      cornersSquareColor: '#4f46e5',
      cornersDotType: 'dot',
      cornersDotColor: '#9333ea',
      bgColor: '#ffffff'
    }
  },
  {
    id: 'corporate-navy',
    name: 'Corporativo',
    description: 'Azul marino profesional y confiable para negocios',
    previewBg: '#1e3a8a',
    config: {
      dotsType: 'rounded',
      useGradient: false,
      singleColor: '#1e3a8a',
      cornersSquareType: 'extra-rounded',
      cornersSquareColor: '#1e3a8a',
      cornersDotType: 'dot',
      cornersDotColor: '#1e3a8a',
      bgColor: '#ffffff'
    }
  },
  {
    id: 'classic-clean',
    name: 'Clásico Blanco y Negro',
    description: 'Estilo clásico con máxima compatibilidad de escaneo',
    previewBg: '#000000',
    config: {
      dotsType: 'square',
      useGradient: false,
      singleColor: '#000000',
      cornersSquareType: 'square',
      cornersSquareColor: '#000000',
      cornersDotType: 'square',
      cornersDotColor: '#000000',
      bgColor: '#ffffff'
    }
  }
];
