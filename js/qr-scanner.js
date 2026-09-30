// Módulo de lectura y escaneo de códigos QR mediante cámara web o archivo de imagen usando jsQR

class QRScannerManager {
  constructor() {
    this.videoStream = null;
    this.animationId = null;
    this.isScanning = false;
    this.scanCanvas = document.createElement('canvas');
    this.scanCtx = this.scanCanvas.getContext('2d', { willReadFrequently: true });
  }

  init() {
    this.videoEl = document.getElementById('scanner-video');
    this.dropZone = document.getElementById('scanner-dropzone');
    this.fileInput = document.getElementById('scanner-file-input');
    this.btnStartCam = document.getElementById('btn-start-camera');
    this.btnStopCam = document.getElementById('btn-stop-camera');
    this.cameraContainer = document.getElementById('camera-stream-container');
    this.scanResultCard = document.getElementById('scanner-result-card');
    this.scanResultText = document.getElementById('scanner-result-text');
    this.btnCopyResult = document.getElementById('btn-copy-scan-result');
    this.btnLoadToGen = document.getElementById('btn-load-to-generator');
    this.btnOpenLink = document.getElementById('btn-open-scan-link');

    this.bindEvents();
  }

  bindEvents() {
    if (this.btnStartCam) {
      this.btnStartCam.addEventListener('click', () => this.startCamera());
    }
    if (this.btnStopCam) {
      this.btnStopCam.addEventListener('click', () => this.stopCamera());
    }

    if (this.dropZone && this.fileInput) {
      this.dropZone.addEventListener('click', () => this.fileInput.click());
      this.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.scanImageFile(e.target.files[0]);
        }
      });

      // Drag & drop
      ['dragenter', 'dragover'].forEach(eventName => {
        this.dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropZone.classList.add('drag-active');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        this.dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropZone.classList.remove('drag-active');
        });
      });

      this.dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          this.scanImageFile(files[0]);
        }
      });
    }

    if (this.btnCopyResult) {
      this.btnCopyResult.addEventListener('click', () => {
        const text = this.scanResultText ? this.scanResultText.textContent : '';
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            if (window.showToast) window.showToast('¡Texto copiado al portapapeles!', 'success');
          });
        }
      });
    }

    if (this.btnLoadToGen) {
      this.btnLoadToGen.addEventListener('click', () => {
        const text = this.scanResultText ? this.scanResultText.textContent : '';
        if (text && window.app) {
          window.app.loadScannedDataIntoGenerator(text);
          if (window.showToast) window.showToast('¡Cargado en el generador!', 'info');
        }
      });
    }

    if (this.btnOpenLink) {
      this.btnOpenLink.addEventListener('click', () => {
        const text = this.scanResultText ? this.scanResultText.textContent : '';
        if (text && /^https?:\/\//i.test(text)) {
          window.open(text, '_blank', 'noopener,noreferrer');
        }
      });
    }
  }

  async startCamera() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta el acceso a la cámara.');
      }

      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      this.videoEl.srcObject = this.videoStream;
      this.videoEl.setAttribute('playsinline', true);
      await this.videoEl.play();

      this.isScanning = true;
      if (this.cameraContainer) this.cameraContainer.style.display = 'block';
      if (this.btnStartCam) this.btnStartCam.style.display = 'none';
      if (this.btnStopCam) this.btnStopCam.style.display = 'inline-flex';

      this.tick();
      if (window.showToast) window.showToast('Cámara iniciada. Apunta a un código QR.', 'info');
    } catch (err) {
      console.error(err);
      if (window.showToast) {
        window.showToast('No se pudo acceder a la cámara: ' + (err.message || 'Permiso denegado'), 'error');
      }
    }
  }

  stopCamera() {
    this.isScanning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    if (this.cameraContainer) this.cameraContainer.style.display = 'none';
    if (this.btnStartCam) this.btnStartCam.style.display = 'inline-flex';
    if (this.btnStopCam) this.btnStopCam.style.display = 'none';
  }

  tick() {
    if (!this.isScanning) return;

    if (this.videoEl.readyState === this.videoEl.HAVE_ENOUGH_DATA) {
      this.scanCanvas.height = this.videoEl.videoHeight;
      this.scanCanvas.width = this.videoEl.videoWidth;
      this.scanCtx.drawImage(this.videoEl, 0, 0, this.scanCanvas.width, this.scanCanvas.height);

      const imageData = this.scanCtx.getImageData(0, 0, this.scanCanvas.width, this.scanCanvas.height);
      if (typeof jsQR !== 'undefined') {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          this.handleScanSuccess(code.data);
          this.stopCamera();
          return;
        }
      }
    }

    this.animationId = requestAnimationFrame(() => this.tick());
  }

  scanImageFile(file) {
    if (!file.type.startsWith('image/')) {
      if (window.showToast) window.showToast('Por favor selecciona un archivo de imagen válido.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.scanCanvas.width = img.width;
        this.scanCanvas.height = img.height;
        this.scanCtx.drawImage(img, 0, 0);

        const imageData = this.scanCtx.getImageData(0, 0, img.width, img.height);
        if (typeof jsQR !== 'undefined') {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            this.handleScanSuccess(code.data);
          } else {
            if (window.showToast) window.showToast('No se encontró ningún código QR legible en la imagen.', 'error');
          }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  handleScanSuccess(data) {
    if (this.scanResultCard) this.scanResultCard.style.display = 'block';
    if (this.scanResultText) this.scanResultText.textContent = data;

    const isLink = /^https?:\/\//i.test(data);
    if (this.btnOpenLink) {
      this.btnOpenLink.style.display = isLink ? 'inline-flex' : 'none';
    }

    if (window.showToast) window.showToast('¡Código QR detectado con éxito!', 'success');
  }
}

window.QRScannerManager = QRScannerManager;
