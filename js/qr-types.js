// Definición de tipos de contenido QR y generadores de payload formateado

const QR_TYPES = {
  url: {
    id: 'url',
    name: 'Enlace / URL',
    icon: '🌐',
    description: 'Direcciona a cualquier sitio web o página',
    renderForm: () => `
      <div class="form-group">
        <label for="input-url">Dirección Web (URL)</label>
        <div class="input-with-icon">
          <span class="input-icon">🔗</span>
          <input type="url" id="input-url" class="form-control" placeholder="https://ejemplo.com" value="https://google.com" autofocus />
        </div>
        <div class="form-hint">Tip: Puedes pegar cualquier enlace de YouTube, redes sociales o tu tienda.</div>
      </div>
    `,
    getPayload: () => {
      const el = document.getElementById('input-url');
      let val = el ? el.value.trim() : '';
      if (!val) return 'https://';
      if (!/^https?:\/\//i.test(val) && !val.startsWith('//')) {
        val = 'https://' + val;
      }
      return val;
    }
  },

  text: {
    id: 'text',
    name: 'Texto',
    icon: '📝',
    description: 'Texto libre, notas o información legible',
    renderForm: () => `
      <div class="form-group">
        <label for="input-text">Contenido de texto</label>
        <textarea id="input-text" class="form-control" rows="4" placeholder="Escribe cualquier mensaje, descripción o código...">¡Hola! Este es un código QR personalizado creado con QR Studio Pro.</textarea>
        <div class="form-hint">Cualquier escáner mostrará este texto en pantalla.</div>
      </div>
    `,
    getPayload: () => {
      const el = document.getElementById('input-text');
      return el ? el.value.trim() : '';
    }
  },

  wifi: {
    id: 'wifi',
    name: 'Red Wi-Fi',
    icon: '📶',
    description: 'Permite conectarse a una red WiFi al escanear',
    renderForm: () => `
      <div class="form-group">
        <label for="wifi-ssid">Nombre de la red (SSID)</label>
        <div class="input-with-icon">
          <span class="input-icon">📡</span>
          <input type="text" id="wifi-ssid" class="form-control" placeholder="Mi_Red_WiFi" value="MiRedWiFi" />
        </div>
      </div>
      <div class="form-group">
        <label for="wifi-password">Contraseña</label>
        <div class="input-with-icon">
          <span class="input-icon">🔑</span>
          <input type="password" id="wifi-password" class="form-control" placeholder="Contraseña de la red" value="clave12345" />
          <button type="button" class="btn-toggle-pass" id="btn-toggle-wifi-pass" title="Mostrar/Ocultar contraseña">👁️</button>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col">
          <label for="wifi-encryption">Seguridad</label>
          <select id="wifi-encryption" class="form-control">
            <option value="WPA" selected>WPA / WPA2 / WPA3 (Estándar)</option>
            <option value="WEP">WEP (Antiguo)</option>
            <option value="nopass">Sin contraseña (Abierta)</option>
          </select>
        </div>
        <div class="form-group col-checkbox">
          <label class="checkbox-label" for="wifi-hidden">
            <input type="checkbox" id="wifi-hidden" />
            <span>Red oculta</span>
          </label>
        </div>
      </div>
    `,
    initEvents: () => {
      const toggleBtn = document.getElementById('btn-toggle-wifi-pass');
      const passInput = document.getElementById('wifi-password');
      if (toggleBtn && passInput) {
        toggleBtn.addEventListener('click', () => {
          const isPassword = passInput.type === 'password';
          passInput.type = isPassword ? 'text' : 'password';
          toggleBtn.textContent = isPassword ? '🙈' : '👁️';
        });
      }
    },
    getPayload: () => {
      const ssidEl = document.getElementById('wifi-ssid');
      const passEl = document.getElementById('wifi-password');
      const encEl = document.getElementById('wifi-encryption');
      const hiddenEl = document.getElementById('wifi-hidden');

      const ssid = ssidEl ? ssidEl.value.trim() : '';
      const pass = passEl ? passEl.value : '';
      const enc = encEl ? encEl.value : 'WPA';
      const hidden = hiddenEl ? hiddenEl.checked : false;

      // Escapar caracteres reservados \ ; , : "
      const escape = str => str.replace(/([\\;,:"])/g, '\\$1');

      if (enc === 'nopass') {
        return `WIFI:T:nopass;S:${escape(ssid)};;${hidden ? 'H:true;' : ''}`;
      }
      return `WIFI:T:${enc};S:${escape(ssid)};P:${escape(pass)};${hidden ? 'H:true;' : ''};`;
    }
  },

  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    description: 'Abre un chat directo con mensaje predeterminado',
    renderForm: () => `
      <div class="form-group">
        <label for="wa-phone">Número con código de país (sin el signo +)</label>
        <div class="input-with-icon">
          <span class="input-icon">📞</span>
          <input type="tel" id="wa-phone" class="form-control" placeholder="Ej: 56912345678, 54911..., 346..." value="56912345678" />
        </div>
        <div class="form-hint">Escribe el código de país seguido del número, ejemplo: 34 para España, 54 para Argentina, 56 para Chile, 52 para México.</div>
      </div>
      <div class="form-group">
        <label for="wa-message">Mensaje inicial (opcional)</label>
        <textarea id="wa-message" class="form-control" rows="3" placeholder="Hola, me comunico a través del código QR...">¡Hola! Me interesa obtener más información.</textarea>
      </div>
    `,
    getPayload: () => {
      const phoneEl = document.getElementById('wa-phone');
      const msgEl = document.getElementById('wa-message');
      const phone = phoneEl ? phoneEl.value.replace(/[^0-9]/g, '') : '';
      const msg = msgEl ? msgEl.value.trim() : '';
      if (!phone) return 'https://wa.me/';
      return msg ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/${phone}`;
    }
  },

  vcard: {
    id: 'vcard',
    name: 'Tarjeta Contacto',
    icon: '👤',
    description: 'Guarda todos tus datos en la agenda del teléfono',
    renderForm: () => `
      <div class="form-row">
        <div class="form-group col">
          <label for="vc-first">Nombre</label>
          <input type="text" id="vc-first" class="form-control" placeholder="Juan" value="Juan" />
        </div>
        <div class="form-group col">
          <label for="vc-last">Apellido</label>
          <input type="text" id="vc-last" class="form-control" placeholder="Pérez" value="Pérez" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col">
          <label for="vc-company">Empresa / Negocio</label>
          <input type="text" id="vc-company" class="form-control" placeholder="Innovación Digital" value="Innovación Digital" />
        </div>
        <div class="form-group col">
          <label for="vc-title">Cargo / Puesto</label>
          <input type="text" id="vc-title" class="form-control" placeholder="Director Comercial" value="Director Comercial" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col">
          <label for="vc-phone">Teléfono Móvil</label>
          <input type="tel" id="vc-phone" class="form-control" placeholder="+1234567890" value="+1234567890" />
        </div>
        <div class="form-group col">
          <label for="vc-email">Correo Electrónico</label>
          <input type="email" id="vc-email" class="form-control" placeholder="juan@ejemplo.com" value="juan@ejemplo.com" />
        </div>
      </div>
      <div class="form-group">
        <label for="vc-url">Sitio Web</label>
        <input type="url" id="vc-url" class="form-control" placeholder="https://ejemplo.com" value="https://ejemplo.com" />
      </div>
      <div class="form-group">
        <label for="vc-address">Dirección (Opcional)</label>
        <input type="text" id="vc-address" class="form-control" placeholder="Av. Principal 123, Ciudad" />
      </div>
    `,
    getPayload: () => {
      const getVal = id => (document.getElementById(id) ? document.getElementById(id).value.trim() : '');
      const first = getVal('vc-first');
      const last = getVal('vc-last');
      const company = getVal('vc-company');
      const title = getVal('vc-title');
      const phone = getVal('vc-phone');
      const email = getVal('vc-email');
      const url = getVal('vc-url');
      const address = getVal('vc-address');

      let lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${last};${first};;;`,
        `FN:${first} ${last}`.trim()
      ];

      if (company) lines.push(`ORG:${company}`);
      if (title) lines.push(`TITLE:${title}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (email) lines.push(`EMAIL:${email}`);
      if (url) lines.push(`URL:${url}`);
      if (address) lines.push(`ADR;TYPE=WORK:;;${address};;;;`);
      lines.push('END:VCARD');

      return lines.join('\n');
    }
  },

  email: {
    id: 'email',
    name: 'Correo Email',
    icon: '✉️',
    description: 'Envío de correo con destinatario y asunto listo',
    renderForm: () => `
      <div class="form-group">
        <label for="em-to">Destinatario (Para)</label>
        <input type="email" id="em-to" class="form-control" placeholder="contacto@empresa.com" value="contacto@empresa.com" />
      </div>
      <div class="form-group">
        <label for="em-subject">Asunto</label>
        <input type="text" id="em-subject" class="form-control" placeholder="Consulta sobre servicios" value="Consulta comercial" />
      </div>
      <div class="form-group">
        <label for="em-body">Cuerpo del mensaje (opcional)</label>
        <textarea id="em-body" class="form-control" rows="3" placeholder="Hola, me gustaría solicitar una cotización...">Hola, me gustaría solicitar información detallada sobre sus servicios.</textarea>
      </div>
    `,
    getPayload: () => {
      const to = document.getElementById('em-to')?.value.trim() || '';
      const subject = document.getElementById('em-subject')?.value.trim() || '';
      const body = document.getElementById('em-body')?.value.trim() || '';

      const params = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);

      return `mailto:${to}${params.length ? '?' + params.join('&') : ''}`;
    }
  },

  phone: {
    id: 'phone',
    name: 'Llamada',
    icon: '📞',
    description: 'Inicia una llamada telefónica al número indicado',
    renderForm: () => `
      <div class="form-group">
        <label for="tel-number">Número de Teléfono</label>
        <div class="input-with-icon">
          <span class="input-icon">📱</span>
          <input type="tel" id="tel-number" class="form-control" placeholder="+1234567890" value="+56912345678" />
        </div>
        <div class="form-hint">Al escanear el código, el dispositivo abrirá la app de llamadas con este número.</div>
      </div>
    `,
    getPayload: () => {
      const tel = document.getElementById('tel-number')?.value.trim() || '';
      return `tel:${tel}`;
    }
  },

  sms: {
    id: 'sms',
    name: 'SMS',
    icon: '📨',
    description: 'Envía un mensaje de texto SMS prediseñado',
    renderForm: () => `
      <div class="form-group">
        <label for="sms-number">Número destinatario</label>
        <input type="tel" id="sms-number" class="form-control" placeholder="+1234567890" value="+56912345678" />
      </div>
      <div class="form-group">
        <label for="sms-message">Mensaje SMS</label>
        <textarea id="sms-message" class="form-control" rows="3" placeholder="Mensaje de texto...">CONFIRMAR 1234</textarea>
      </div>
    `,
    getPayload: () => {
      const num = document.getElementById('sms-number')?.value.trim() || '';
      const msg = document.getElementById('sms-message')?.value.trim() || '';
      return `smsto:${num}:${msg}`;
    }
  },

  location: {
    id: 'location',
    name: 'Ubicación',
    icon: '📍',
    description: 'Abre Google Maps en una coordenada o dirección',
    renderForm: () => `
      <div class="form-row">
        <div class="form-group col">
          <label for="loc-lat">Latitud</label>
          <input type="text" id="loc-lat" class="form-control" placeholder="-33.4489" value="-33.4489" />
        </div>
        <div class="form-group col">
          <label for="loc-lng">Longitud</label>
          <input type="text" id="loc-lng" class="form-control" placeholder="-70.6693" value="-70.6693" />
        </div>
      </div>
      <div class="form-group">
        <label for="loc-query">O buscar por nombre / lugar</label>
        <input type="text" id="loc-query" class="form-control" placeholder="Ej: Torre Eiffel, París" />
      </div>
    `,
    getPayload: () => {
      const query = document.getElementById('loc-query')?.value.trim();
      if (query) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      }
      const lat = document.getElementById('loc-lat')?.value.trim() || '0';
      const lng = document.getElementById('loc-lng')?.value.trim() || '0';
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
  }
};
