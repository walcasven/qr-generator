# ⚡ QR Studio Pro

Una aplicación web moderna, interactiva y de alta fidelidad para generar, personalizar, descargar y escanear códigos QR en resoluciones ultra altas (PNG, SVG vectorial, WebP).

---

## ✨ Características Principales

### 1. Formatos de Contenido Múltiples
- 🌐 **Enlaces / URLs**: Redirección inmediata a sitios web, redes sociales, videos de YouTube, etc.
- 📝 **Texto Libre**: Notas, mensajes o fragmentos de código.
- 📶 **Wi-Fi**: Configuración automática de conexión para dispositivos móviles (SSID, contraseña, seguridad WPA/WPA2/WPA3/WEP y redes ocultas).
- 💬 **WhatsApp**: Enlace directo a chat con prefijo de país y mensaje inicial predefinido.
- 👤 **Tarjeta de Contacto (vCard 3.0)**: Guarda nombre, teléfono, correo, empresa, cargo, dirección y sitio web directamente en la agenda.
- ✉️ **Correo Electrónico (mailto)**: Destinatario, asunto y cuerpo de mensaje listos para enviar.
- 📞 **Llamada Telefónica**: Marcación directa con un toque.
- 📨 **SMS**: Mensaje de texto preformateado.
- 📍 **Ubicación GPS**: Coordenadas geográficas y búsqueda en Google Maps.

### 2. Estudio de Personalización y Diseño Visual
- **Formas de Puntos (Dots)**: Cuadrados clásicos, redondeados, puntos circulares, extra-redondeados (cápsula), classy y classy-rounded.
- **Marcos y Centros de Esquinas**: Personalización independiente de esquinas exteriores e interiores.
- **Colores & Gradientes**: Modo color sólido o gradientes lineales/radiales con ángulo regulable.
- **Fondo Personalizable**: Blanco puro, colores personalizados o fondo transparente (ideal para diseñadores gráficos).
- **Logotipos e Iconos en el Centro**:
  - Catálogo de iconos rápidos: WhatsApp, Wi-Fi, Instagram, YouTube, X (Twitter), GitHub, LinkedIn, Sitio Web, Correo y Favoritos.
  - Subida de logotipo propio (PNG, SVG, JPG, WebP).
  - Control de tamaño del logo y margen de separación.
- **Plantillas Rápidas (1-Click Presets)**: Cyber Neon, Sunset Glow, Esmeralda, Royal Violet, Corporativo y Clásico.
- **Ajustes Técnicos**: Selector de nivel de corrección de errores (L, M, Q, H) y margen exterior.

### 3. Opciones Profesionales de Exportación
- 📥 **Descarga PNG en Alta Definición**: Selector de resolución (512x512, 1024x1024, 2048x2048 Ultra HD y 4096x4096 para impresión profesional).
- 📐 **Descarga Vectorial SVG**: Calidad infinita sin pixelado, ideal para imprenta, cartelería o diseño vectorial.
- 📋 **Copiar Imagen al Portapapeles**: Copia directa en memoria para pegar (Ctrl+V) en WhatsApp Web, Photoshop, Word, Canva, etc.
- 🖨️ **Impresión Directa**: Genera una hoja limpia lista para imprimir y recortar.

### 4. Lector y Escáner QR Integrado
- 📷 Escaneo en vivo con cámara web o cámara del móvil.
- 📤 Lectura de imágenes por arrastrar y soltar (Drag & Drop) o selección de archivo.
- Botones de acción rápida: Copiar texto detectado, abrir enlace o cargarlo directamente en el generador para editarlo.

### 5. Historial Local
- Guarda automáticamente los códigos generados en `localStorage` con miniaturas, fecha y contenido para volver a utilizarlos en cualquier momento.

---

## 🚀 Cómo Iniciar la Aplicación

### Opción 1: Servidor de Desarrollo Local (Recomendado)
Abre una terminal en esta carpeta y ejecuta:

```bash
npm run dev
```

Luego abre en tu navegador:
```
http://localhost:3000
```

### Opción 2: Abrir directamente sin servidor
También puedes hacer doble clic en el archivo `index.html` para abrirlo directamente en tu navegador habitual (Chrome, Edge, Firefox, Safari).

---

## 🛠️ Tecnologías Utilizadas
- **HTML5 Semántico**: Estructura accesible y modular.
- **CSS3 Vanilla**: Sistema de diseño Dark Glassmorphism, variables CSS, microanimaciones y diseño 100% responsivo.
- **JavaScript Vanilla (ES6+)**: Lógica reactiva sin dependencias pesadas de framework.
- **qr-code-styling**: Generación y renderizado SVG/Canvas con alta personalización.
- **jsQR**: Decodificación y escaneo de códigos QR en tiempo real.
"# qr-generator" 
