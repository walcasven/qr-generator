// Controlador principal de QR Studio Pro

class QRApp {
  constructor() {
    this.currentType = 'url';
    this.qrCodeInstance = null;
    this.qrContainer = document.getElementById('qr-preview-canvas');
    this.historyKey = 'qr_studio_history_v1';
    this.customLogoDataUrl = null;
    this.selectedPresetLogoId = null;
    this.updateTimeout = null;

    // Estado de configuración por defecto
    this.state = {
      data: 'https://google.com',
      width: 400,
      height: 400,
      margin: 10,
      dotsOptions: {
        type: 'rounded',
        color: '#1e293b',
        gradient: null
      },
      cornersSquareOptions: {
        type: 'extra-rounded',
        color: '#0f172a'
      },
      cornersDotOptions: {
        type: 'dot',
        color: '#0f172a'
      },
      backgroundOptions: {
        color: '#ffffff'
      },
      image: null,
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.35,
        margin: 4
      },
      qrOptions: {
        errorCorrectionLevel: 'Q'
      }
    };
  }

  init() {
    this.initQRCode();
    this.renderTypeTabs();
    this.renderActiveTypeForm();
    this.renderPresets();
    this.renderLogoPresets();
    this.bindEvents();
    this.loadHistory();
    this.updateQR();

    // Inicializar escáner
    this.scanner = new QRScannerManager();
    this.scanner.init();
  }

  initQRCode() {
    if (typeof QRCodeStyling === 'undefined') {
      console.error('QRCodeStyling library not loaded!');
      return;
    }

    this.qrCodeInstance = new QRCodeStyling({
      width: 320,
      height: 320,
      data: this.state.data,
      margin: this.state.margin,
      qrOptions: this.state.qrOptions,
      dotsOptions: this.state.dotsOptions,
      cornersSquareOptions: this.state.cornersSquareOptions,
      cornersDotOptions: this.state.cornersDotOptions,
      backgroundOptions: this.state.backgroundOptions,
      image: this.state.image,
      imageOptions: this.state.imageOptions
    });

    if (this.qrContainer) {
      this.qrContainer.innerHTML = '';
      this.qrCodeInstance.append(this.qrContainer);
    }
  }

  renderTypeTabs() {
    const container = document.getElementById('qr-type-tabs');
    if (!container) return;

    container.innerHTML = Object.values(QR_TYPES).map(type => `
      <button type="button" class="type-tab-btn ${type.id === this.currentType ? 'active' : ''}" data-type="${type.id}">
        <span class="type-icon">${type.icon}</span>
        <span class="type-label">${type.name}</span>
      </button>
    `).join('');

    container.querySelectorAll('.type-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const typeId = btn.dataset.type;
        if (typeId === this.currentType) return;

        container.querySelectorAll('.type-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.currentType = typeId;
        this.renderActiveTypeForm();
        this.updateDataFromForm();
      });
    });
  }

  renderActiveTypeForm() {
    const formContainer = document.getElementById('qr-type-form-container');
    const typeObj = QR_TYPES[this.currentType];
    if (!formContainer || !typeObj) return;

    formContainer.innerHTML = typeObj.renderForm();
    if (typeObj.initEvents) typeObj.initEvents();

    // Escuchar cambios en todos los inputs del formulario
    formContainer.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', () => this.debounceUpdate());
      input.addEventListener('change', () => this.debounceUpdate());
    });
  }

  renderPresets() {
    const container = document.getElementById('presets-grid');
    if (!container) return;

    container.innerHTML = QR_PRESETS.map(p => `
      <div class="preset-card" data-preset="${p.id}" title="${p.name}: ${p.description}">
        <div class="preset-preview" style="background: ${p.previewBg};"></div>
        <div class="preset-name">${p.name}</div>
      </div>
    `).join('');

    container.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const presetId = card.dataset.preset;
        const preset = QR_PRESETS.find(p => p.id === presetId);
        if (preset) {
          this.applyPreset(preset);
          window.showToast(`Plantilla "${preset.name}" aplicada`, 'info');
        }
      });
    });
  }

  renderLogoPresets() {
    const container = document.getElementById('logo-presets-grid');
    if (!container) return;

    const list = Object.values(QR_ICONS);
    container.innerHTML = list.map(item => `
      <button type="button" class="logo-preset-btn ${item.id === 'none' ? 'active' : ''}" data-logo-id="${item.id}" title="${item.name}">
        ${item.id === 'none' 
          ? '<span class="logo-none-icon">🚫</span><span class="logo-preset-text">Sin logo</span>' 
          : `<span class="logo-svg-wrap" style="color: ${item.color || '#333'}">${item.svg}</span><span class="logo-preset-text">${item.name}</span>`
        }
      </button>
    `).join('');

    container.querySelectorAll('.logo-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.logo-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const logoId = btn.dataset.logoId;
        this.selectedPresetLogoId = logoId;
        this.customLogoDataUrl = null;

        // Limpiar input file
        const fileInput = document.getElementById('custom-logo-input');
        if (fileInput) fileInput.value = '';

        if (logoId === 'none') {
          this.state.image = null;
        } else {
          this.state.image = getIconDataUrl(logoId);
          // Asegurar nivel H para que el logo no perjudique la lectura
          this.state.qrOptions.errorCorrectionLevel = 'H';
          const ecSelect = document.getElementById('opt-error-correction');
          if (ecSelect) ecSelect.value = 'H';
        }

        this.updateQR();
      });
    });
  }

  applyPreset(preset) {
    const c = preset.config;

    // Dots
    this.state.dotsOptions.type = c.dotsType || 'rounded';
    document.getElementById('opt-dots-type').value = c.dotsType || 'rounded';

    if (c.useGradient) {
      document.getElementById('dots-color-mode-gradient').checked = true;
      document.getElementById('gradient-controls').style.display = 'block';
      document.getElementById('single-color-controls').style.display = 'none';

      document.getElementById('opt-grad-color1').value = c.gradientColor1;
      document.getElementById('opt-grad-color2').value = c.gradientColor2;
      document.getElementById('opt-grad-angle').value = c.gradientAngle || 45;

      const angleRad = ((c.gradientAngle || 45) * Math.PI) / 180;
      this.state.dotsOptions.color = undefined;
      this.state.dotsOptions.gradient = {
        type: c.gradientType || 'linear',
        rotation: angleRad,
        colorStops: [
          { offset: 0, color: c.gradientColor1 },
          { offset: 1, color: c.gradientColor2 }
        ]
      };
    } else {
      document.getElementById('dots-color-mode-single').checked = true;
      document.getElementById('gradient-controls').style.display = 'none';
      document.getElementById('single-color-controls').style.display = 'block';

      document.getElementById('opt-dots-color').value = c.singleColor || '#000000';
      this.state.dotsOptions.color = c.singleColor || '#000000';
      this.state.dotsOptions.gradient = null;
    }

    // Esquinas
    this.state.cornersSquareOptions.type = c.cornersSquareType || 'extra-rounded';
    this.state.cornersSquareOptions.color = c.cornersSquareColor || '#000000';
    document.getElementById('opt-corner-square-type').value = c.cornersSquareType || 'extra-rounded';
    document.getElementById('opt-corner-square-color').value = c.cornersSquareColor || '#000000';

    this.state.cornersDotOptions.type = c.cornersDotType || 'dot';
    this.state.cornersDotOptions.color = c.cornersDotColor || '#000000';
    document.getElementById('opt-corner-dot-type').value = c.cornersDotType || 'dot';
    document.getElementById('opt-corner-dot-color').value = c.cornersDotColor || '#000000';

    // Fondo
    this.state.backgroundOptions.color = c.bgColor || '#ffffff';
    document.getElementById('opt-bg-color').value = c.bgColor || '#ffffff';

    this.updateQR();
  }

  bindEvents() {
    // Pestañas Generador vs Escáner
    const mainTabs = document.querySelectorAll('.main-nav-tab');
    mainTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        mainTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const mode = tab.dataset.mode;
        document.getElementById('panel-generator').style.display = mode === 'generator' ? 'grid' : 'none';
        document.getElementById('panel-scanner').style.display = mode === 'scanner' ? 'block' : 'none';

        if (mode !== 'scanner' && this.scanner) {
          this.scanner.stopCamera();
        }
      });
    });

    // Acordeón / Pestañas de diseño
    const styleTabBtns = document.querySelectorAll('.style-tab-btn');
    const stylePanels = document.querySelectorAll('.style-panel-content');
    styleTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        styleTabBtns.forEach(b => b.classList.remove('active'));
        stylePanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.dataset.panel;
        const panel = document.getElementById(targetId);
        if (panel) panel.classList.add('active');
      });
    });

    // Control de color único vs degradado
    const radioSingle = document.getElementById('dots-color-mode-single');
    const radioGrad = document.getElementById('dots-color-mode-gradient');
    const singleWrap = document.getElementById('single-color-controls');
    const gradWrap = document.getElementById('gradient-controls');

    if (radioSingle && radioGrad) {
      radioSingle.addEventListener('change', () => {
        if (radioSingle.checked) {
          singleWrap.style.display = 'block';
          gradWrap.style.display = 'none';
          this.syncColorsFromUI();
        }
      });
      radioGrad.addEventListener('change', () => {
        if (radioGrad.checked) {
          singleWrap.style.display = 'none';
          gradWrap.style.display = 'block';
          this.syncColorsFromUI();
        }
      });
    }

    // Color inputs
    const colorInputs = [
      'opt-dots-color', 'opt-grad-color1', 'opt-grad-color2', 'opt-grad-angle',
      'opt-corner-square-color', 'opt-corner-dot-color', 'opt-bg-color'
    ];
    colorInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.syncColorsFromUI());
      }
    });

    // Fondo transparente toggle
    const chkTransparent = document.getElementById('opt-bg-transparent');
    if (chkTransparent) {
      chkTransparent.addEventListener('change', (e) => {
        const bgPicker = document.getElementById('opt-bg-color');
        if (e.target.checked) {
          this.state.backgroundOptions.color = 'transparent';
          if (bgPicker) bgPicker.disabled = true;
        } else {
          if (bgPicker) {
            bgPicker.disabled = false;
            this.state.backgroundOptions.color = bgPicker.value;
          }
        }
        this.updateQR();
      });
    }

    // Dropdowns de formas
    const shapeInputs = [
      'opt-dots-type', 'opt-corner-square-type', 'opt-corner-dot-type',
      'opt-error-correction', 'opt-margin'
    ];
    shapeInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => this.syncSettingsFromUI());
      }
    });

    // Margen slider
    const marginSlider = document.getElementById('opt-margin');
    const marginVal = document.getElementById('opt-margin-val');
    if (marginSlider && marginVal) {
      marginSlider.addEventListener('input', (e) => {
        marginVal.textContent = `${e.target.value}px`;
        this.state.margin = parseInt(e.target.value, 10);
        this.updateQR();
      });
    }

    // Logo custom upload
    const customLogoInput = document.getElementById('custom-logo-input');
    const removeLogoBtn = document.getElementById('btn-remove-logo');
    if (customLogoInput) {
      customLogoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (evt) => {
            this.customLogoDataUrl = evt.target.result;
            this.state.image = this.customLogoDataUrl;
            this.state.qrOptions.errorCorrectionLevel = 'H';
            const ecSelect = document.getElementById('opt-error-correction');
            if (ecSelect) ecSelect.value = 'H';

            // Desmarcar presets
            document.querySelectorAll('.logo-preset-btn').forEach(b => b.classList.remove('active'));

            this.updateQR();
            window.showToast('Logo personalizado cargado', 'success');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (removeLogoBtn) {
      removeLogoBtn.addEventListener('click', () => {
        this.customLogoDataUrl = null;
        this.state.image = null;
        if (customLogoInput) customLogoInput.value = '';
        document.querySelectorAll('.logo-preset-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.logoId === 'none');
        });
        this.updateQR();
        window.showToast('Logo eliminado', 'info');
      });
    }

    // Logo size & margin sliders
    const logoSizeSlider = document.getElementById('opt-logo-size');
    const logoSizeVal = document.getElementById('opt-logo-size-val');
    if (logoSizeSlider && logoSizeVal) {
      logoSizeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        logoSizeVal.textContent = `${Math.round(val * 100)}%`;
        this.state.imageOptions.imageSize = val;
        this.updateQR();
      });
    }

    const logoMarginSlider = document.getElementById('opt-logo-margin');
    const logoMarginVal = document.getElementById('opt-logo-margin-val');
    if (logoMarginSlider && logoMarginVal) {
      logoMarginSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        logoMarginVal.textContent = `${val}px`;
        this.state.imageOptions.margin = val;
        this.updateQR();
      });
    }

    // Export Buttons
    document.getElementById('btn-download-png')?.addEventListener('click', () => this.downloadQR('png'));
    document.getElementById('btn-download-svg')?.addEventListener('click', () => this.downloadQR('svg'));
    document.getElementById('btn-download-webp')?.addEventListener('click', () => this.downloadQR('webp'));
    document.getElementById('btn-copy-clipboard')?.addEventListener('click', () => this.copyToClipboard());
    document.getElementById('btn-print-qr')?.addEventListener('click', () => this.printQRCode());
    document.getElementById('btn-save-history')?.addEventListener('click', () => this.saveToHistoryManual());
  }

  syncColorsFromUI() {
    const isGrad = document.getElementById('dots-color-mode-gradient')?.checked;
    if (isGrad) {
      const c1 = document.getElementById('opt-grad-color1')?.value || '#00c6ff';
      const c2 = document.getElementById('opt-grad-color2')?.value || '#0072ff';
      const angle = parseInt(document.getElementById('opt-grad-angle')?.value || '45', 10);
      const angleRad = (angle * Math.PI) / 180;

      this.state.dotsOptions.color = undefined;
      this.state.dotsOptions.gradient = {
        type: 'linear',
        rotation: angleRad,
        colorStops: [
          { offset: 0, color: c1 },
          { offset: 1, color: c2 }
        ]
      };
    } else {
      const c = document.getElementById('opt-dots-color')?.value || '#000000';
      this.state.dotsOptions.color = c;
      this.state.dotsOptions.gradient = null;
    }

    // Esquinas
    this.state.cornersSquareOptions.color = document.getElementById('opt-corner-square-color')?.value || '#000000';
    this.state.cornersDotOptions.color = document.getElementById('opt-corner-dot-color')?.value || '#000000';

    // Fondo
    const isTransparent = document.getElementById('opt-bg-transparent')?.checked;
    if (isTransparent) {
      this.state.backgroundOptions.color = 'transparent';
    } else {
      this.state.backgroundOptions.color = document.getElementById('opt-bg-color')?.value || '#ffffff';
    }

    this.updateQR();
  }

  syncSettingsFromUI() {
    this.state.dotsOptions.type = document.getElementById('opt-dots-type')?.value || 'rounded';
    this.state.cornersSquareOptions.type = document.getElementById('opt-corner-square-type')?.value || 'extra-rounded';
    this.state.cornersDotOptions.type = document.getElementById('opt-corner-dot-type')?.value || 'dot';
    this.state.qrOptions.errorCorrectionLevel = document.getElementById('opt-error-correction')?.value || 'Q';

    this.updateQR();
  }

  debounceUpdate() {
    if (this.updateTimeout) clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {
      this.updateDataFromForm();
    }, 120);
  }

  updateDataFromForm() {
    const typeObj = QR_TYPES[this.currentType];
    if (typeObj) {
      this.state.data = typeObj.getPayload() || 'https://';
      this.updateQR();
    }
  }

  updateQR() {
    if (!this.qrCodeInstance) return;

    this.qrCodeInstance.update({
      data: this.state.data,
      margin: this.state.margin,
      qrOptions: this.state.qrOptions,
      dotsOptions: this.state.dotsOptions,
      cornersSquareOptions: this.state.cornersSquareOptions,
      cornersDotOptions: this.state.cornersDotOptions,
      backgroundOptions: this.state.backgroundOptions,
      image: this.state.image,
      imageOptions: this.state.imageOptions
    });

    this.updateMetadataBadges();
  }

  updateMetadataBadges() {
    const byteCountEl = document.getElementById('badge-byte-count');
    const ecBadgeEl = document.getElementById('badge-ec-level');
    const previewDataEl = document.getElementById('preview-data-summary');

    const byteLen = new Blob([this.state.data]).size;
    if (byteCountEl) byteCountEl.textContent = `${byteLen} caracteres`;
    if (ecBadgeEl) ecBadgeEl.textContent = `Nivel ${this.state.qrOptions.errorCorrectionLevel}`;

    if (previewDataEl) {
      const truncated = this.state.data.length > 55
        ? this.state.data.substring(0, 52) + '...'
        : this.state.data;
      previewDataEl.textContent = truncated || '(Vacío)';
    }
  }

  async downloadQR(extension = 'png') {
    if (!this.qrCodeInstance) return;

    const resSelect = document.getElementById('export-resolution');
    const customSize = resSelect ? parseInt(resSelect.value, 10) : 1024;
    const filename = `qrcode-${this.currentType}-${Date.now()}`;

    // Si la resolución pedida es distinta a la de previsualización, creamos una instancia temporal en alta definición
    if (customSize !== 320 && extension !== 'svg') {
      window.showToast(`Generando imagen de alta resolución (${customSize}x${customSize}px)...`, 'info');
      const hdInstance = new QRCodeStyling({
        ...this.state,
        width: customSize,
        height: customSize
      });
      await hdInstance.download({ name: filename, extension: extension });
    } else {
      await this.qrCodeInstance.download({ name: filename, extension: extension });
    }

    this.saveToHistory(filename);
    window.showToast(`¡Código descargado como .${extension.toUpperCase()}!`, 'success');
  }

  async copyToClipboard() {
    try {
      if (!navigator.clipboard || !window.ClipboardItem) {
        throw new Error('El portapapeles de imágenes no está soportado en este navegador.');
      }

      window.showToast('Copiando al portapapeles...', 'info');

      // Generar imagen PNG con resolución óptima para pegar (800x800)
      const exportInstance = new QRCodeStyling({
        ...this.state,
        width: 800,
        height: 800
      });

      const rawBlob = await exportInstance.getRawData('png');
      if (rawBlob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': rawBlob })
        ]);
        window.showToast('¡Imagen copiada! Puedes pegarla (Ctrl+V) en cualquier app.', 'success');
      } else {
        throw new Error('No se pudo generar la imagen del código QR.');
      }
    } catch (err) {
      console.warn('Clipboard write error:', err);
      window.showToast('No se pudo copiar automáticamente. Usa el botón "Descargar PNG".', 'error');
    }
  }

  printQRCode() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.showToast('Por favor habilita las ventanas emergentes para imprimir.', 'error');
      return;
    }

    // Obtener data URL del canvas actual
    const canvas = this.qrContainer.querySelector('canvas');
    const dataUrl = canvas ? canvas.toDataURL('image/png') : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimir Código QR - QR Studio Pro</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              margin: 0;
              padding: 20px;
              color: #111;
            }
            .card {
              border: 2px dashed #ccc;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              max-width: 450px;
            }
            img {
              max-width: 320px;
              height: auto;
              margin-bottom: 20px;
            }
            h2 { margin: 0 0 10px; font-size: 20px; }
            p { margin: 5px 0; font-size: 14px; color: #555; word-break: break-all; }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              background: #f0f0f0;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              margin-top: 10px;
            }
            @media print {
              .card { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Escanea este código QR</h2>
            <img src="${dataUrl}" alt="Código QR" />
            <p><strong>Contenido:</strong> ${this.state.data}</p>
            <div class="badge">Generado con QR Studio Pro</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  saveToHistory(customTitle) {
    try {
      const history = JSON.parse(localStorage.getItem(this.historyKey) || '[]');
      const canvas = this.qrContainer.querySelector('canvas');
      const thumb = canvas ? canvas.toDataURL('image/png') : '';

      const item = {
        id: Date.now().toString(),
        type: this.currentType,
        title: customTitle || `${QR_TYPES[this.currentType].name}`,
        data: this.state.data,
        thumb: thumb,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
      };

      history.unshift(item);
      // Mantener máximo 20 elementos
      if (history.length > 20) history.pop();

      localStorage.setItem(this.historyKey, JSON.stringify(history));
      this.loadHistory();
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  saveToHistoryManual() {
    this.saveToHistory();
    window.showToast('Código guardado en tu historial local.', 'success');
  }

  loadHistory() {
    const listContainer = document.getElementById('history-list');
    if (!listContainer) return;

    try {
      const history = JSON.parse(localStorage.getItem(this.historyKey) || '[]');
      if (history.length === 0) {
        listContainer.innerHTML = `
          <div class="history-empty">
            <span class="empty-icon">📁</span>
            <p>No tienes códigos en el historial todavía. Los códigos que descargues o guardes aparecerán aquí.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = history.map(item => `
        <div class="history-item" data-id="${item.id}">
          <img src="${item.thumb}" class="history-thumb" alt="QR" />
          <div class="history-info">
            <div class="history-title">${item.title}</div>
            <div class="history-data" title="${item.data}">${item.data}</div>
            <div class="history-date">${item.date}</div>
          </div>
          <div class="history-actions">
            <button type="button" class="btn-history-load" title="Recargar este código" data-id="${item.id}">🔄</button>
            <button type="button" class="btn-history-del" title="Eliminar" data-id="${item.id}">🗑️</button>
          </div>
        </div>
      `).join('');

      listContainer.querySelectorAll('.btn-history-load').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const found = history.find(h => h.id === id);
          if (found) {
            this.loadScannedDataIntoGenerator(found.data, found.type);
            window.showToast('Código cargado desde el historial', 'info');
          }
        });
      });

      listContainer.querySelectorAll('.btn-history-del').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const updated = history.filter(h => h.id !== id);
          localStorage.setItem(this.historyKey, JSON.stringify(updated));
          this.loadHistory();
          window.showToast('Elemento eliminado del historial', 'info');
        });
      });

    } catch (e) {
      console.warn(e);
    }
  }

  loadScannedDataIntoGenerator(rawData, preferredType) {
    // Activar pestaña del generador
    document.querySelectorAll('.main-nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.mode === 'generator');
    });
    document.getElementById('panel-generator').style.display = 'grid';
    document.getElementById('panel-scanner').style.display = 'none';

    // Detección automática del tipo si no viene provisto
    let type = preferredType || 'text';
    if (!preferredType) {
      if (/^https?:\/\//i.test(rawData)) type = 'url';
      else if (/^WIFI:/i.test(rawData)) type = 'wifi';
      else if (/^mailto:/i.test(rawData)) type = 'email';
      else if (/^tel:/i.test(rawData)) type = 'phone';
      else if (/^smsto:/i.test(rawData)) type = 'sms';
      else if (/^BEGIN:VCARD/i.test(rawData)) type = 'vcard';
    }

    this.currentType = type;
    this.renderTypeTabs();
    this.renderActiveTypeForm();

    // Rellenar campo relevante
    if (type === 'url') {
      const el = document.getElementById('input-url');
      if (el) el.value = rawData;
    } else if (type === 'text') {
      const el = document.getElementById('input-text');
      if (el) el.value = rawData;
    }

    this.updateDataFromForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Sistema de Notificaciones Flotantes (Toasts)
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('visible'), 10);

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Arrancar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  window.app = new QRApp();
  window.app.init();
});
