class ScannerManager {
    constructor() {
        this.scanHistory = [];
        this.scannerInput = document.getElementById('scannerInput');
        this.lastScanDisplay = document.getElementById('lastScan');
        this.historyList = document.getElementById('historyList');
        this.clearBtn = document.getElementById('clearBtn');
        this.totalScansSpan = document.getElementById('totalScans');
        this.lastTimeSpan = document.getElementById('lastTime');
        
        // Botón de Scanner
        this.openScannerBtn = document.getElementById('openScannerBtn');
        
        // Panel de Debug
        this.debugLog = document.getElementById('debugLog');
        this.debugPanel = document.getElementById('debugPanel');
        this.toggleDebugBtn = document.getElementById('toggleDebug');
        this.clearDebugBtn = document.getElementById('clearDebug');
        this.testScanBtn = document.getElementById('testScan');
        this.isDebugCollapsed = false;
        
        this.scanBuffer = '';
        this.lastKeyTime = 0;
        this.scanTimeout = null;
        this.SCAN_TIMEOUT = 100; // ms - tiempo máximo entre caracteres del scanner
        
        this.init();
    }

    logDebug(message, type = 'info', data = null) {
        const timestamp = new Date().toLocaleTimeString('es-ES');
        const entry = document.createElement('div');
        entry.className = `debug-entry ${type}`;
        
        let content = `[${timestamp}] ${message}`;
        if (data) {
            content += ` | ${JSON.stringify(data)}`;
        }
        
        entry.textContent = content;
        this.debugLog.appendChild(entry);
        
        // Auto-scroll al final
        this.debugLog.parentElement.scrollTop = this.debugLog.parentElement.scrollHeight;
        
        // Limitar a 50 mensajes
        const entries = this.debugLog.querySelectorAll('.debug-entry');
        if (entries.length > 50) {
            entries[0].remove();
        }
    }

    init() {
        this.logDebug('🚀 Aplicación iniciada', 'success');
        
        // Configurar botones de debug
        this.toggleDebugBtn.addEventListener('click', () => this.toggleDebug());
        this.clearDebugBtn.addEventListener('click', () => this.clearDebugLog());
        this.testScanBtn.addEventListener('click', () => this.simulateScan());
        
        // Configurar botón de abrir scanner
        this.openScannerBtn.addEventListener('click', () => this.openScanner());
        
        // Event listeners para el scanner
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        // Listener para cambios en el input (algunos scanners usan este evento)
        this.scannerInput.addEventListener('input', (e) => this.handleInput(e));
        // Listener para Enter en el input
        this.scannerInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        
        this.clearBtn.addEventListener('click', () => this.clearHistory());
        
        // Auto-focus en el input
        this.scannerInput.focus();
        this.logDebug('Input del scanner enfocado', 'info');
        
        // Re-focus si se pierde
        document.addEventListener('click', () => {
            this.scannerInput.focus();
        });

        // Cargar historial del localStorage
        this.loadHistory();
        
        // Logging de eventos globales
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key.length === 1) {
                this.logDebug(`⌨️ Tecla presionada: "${e.key}"`, 'event', { 
                    key: e.key, 
                    code: e.code,
                    keyCode: e.keyCode
                });
            }
        });
    }

    toggleDebug() {
        this.isDebugCollapsed = !this.isDebugCollapsed;
        if (this.isDebugCollapsed) {
            this.debugPanel.classList.add('collapsed');
            this.toggleDebugBtn.textContent = 'Maximizar';
        } else {
            this.debugPanel.classList.remove('collapsed');
            this.toggleDebugBtn.textContent = 'Minimizar';
        }
    }

    clearDebugLog() {
        this.debugLog.innerHTML = '<div class="debug-entry info">Log limpiado</div>';
        this.logDebug('Log limpiado por el usuario', 'info');
    }

    openScanner() {
        this.logDebug('📱 Intentando abrir el scanner del PDA...', 'event');
        this.openScannerBtn.classList.add('loading');
        this.openScannerBtn.textContent = '⏳ Abriendo...';
        
        // Intentar múltiples métodos para activar el scanner
        let scannerOpened = false;

        // Método 1: API específica de UROVO (si está disponible)
        if (window.ScnMgr) {
            try {
                this.logDebug('✓ API ScnMgr detectada (UROVO específico)', 'info');
                window.ScnMgr.startScan();
                this.logDebug('✅ Scanner abierto vía ScnMgr', 'success');
                scannerOpened = true;
            } catch (e) {
                this.logDebug(`⚠️ Error en ScnMgr: ${e.message}`, 'error');
            }
        }

        // Método 2: API genérica de scanner (HTML5)
        if (!scannerOpened && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                this.logDebug('✓ API mediaDevices detectada', 'info');
                this.logDebug('Nota: Se puede usar para acceso a cámara como scanner', 'info');
            } catch (e) {
                this.logDebug(`⚠️ Error en mediaDevices: ${e.message}`, 'error');
            }
        }

        // Método 3: Simular activación por teclado (presionar tecla de scanner)
        if (!scannerOpened) {
            try {
                this.logDebug('📤 Enviando evento de activación de scanner vía teclado', 'event');
                // Algunos scanners responden a teclas especiales
                const event = new KeyboardEvent('keydown', {
                    key: 'F1',
                    code: 'F1',
                    keyCode: 112,
                    bubbles: true
                });
                document.dispatchEvent(event);
                this.logDebug('✓ Evento de teclado enviado', 'event');
            } catch (e) {
                this.logDebug(`⚠️ Error al enviar evento: ${e.message}`, 'error');
            }
        }

        // Método 4: Intentar acceder a APIs específicas del navegador
        if (window.cordova) {
            try {
                this.logDebug('✓ API Cordova detectada', 'info');
                // Si está disponible, intentar abrir scanner vía Cordova
                if (window.cordova.plugins && window.cordova.plugins.barcodeScanner) {
                    this.logDebug('✓ Barcode Scanner Plugin disponible', 'success');
                    window.cordova.plugins.barcodeScanner.scan(
                        (result) => {
                            this.logDebug(`✅ Escaneo completado: ${result.text}`, 'scan');
                            this.scannerInput.value = result.text;
                            this.handleKeyPress({ key: 'Enter', preventDefault: () => {} });
                        },
                        (error) => {
                            this.logDebug(`❌ Error en escaneo: ${error}`, 'error');
                        }
                    );
                    scannerOpened = true;
                }
            } catch (e) {
                this.logDebug(`⚠️ Error en Cordova: ${e.message}`, 'error');
            }
        }

        // Log final
        setTimeout(() => {
            if (!scannerOpened) {
                this.logDebug('⚠️ No se encontró API compatible de scanner', 'error');
                this.logDebug('💡 El scanner del PDA debe estar configurado en modo "Emulación de Teclado"', 'info');
                this.openScannerBtn.classList.add('error');
                this.openScannerBtn.textContent = '❌ No disponible';
            } else {
                this.openScannerBtn.classList.add('success');
                this.openScannerBtn.textContent = '✅ Scanner Abierto';
            }
            
            this.openScannerBtn.classList.remove('loading');
            
            // Volver al estado normal después de 3 segundos
            setTimeout(() => {
                this.openScannerBtn.classList.remove('success', 'error');
                this.openScannerBtn.textContent = '🔲 Abrir Scanner';
            }, 3000);
        }, 500);
    }

    simulateScan() {
        const testCodes = ['1234567890123', '978-3-16-148410', 'SCAN-TEST-001', '5901234123457'];
        const randomCode = testCodes[Math.floor(Math.random() * testCodes.length)];
        
        this.logDebug(`🧪 Simulando escaneo de prueba: ${randomCode}`, 'event');
        
        // Simular entrada de caracteres
        for (let i = 0; i < randomCode.length; i++) {
            setTimeout(() => {
                this.scannerInput.value += randomCode[i];
                this.logDebug(`Carácter ${i + 1}: "${randomCode[i]}"`, 'event');
            }, i * 50);
        }
        
        // Simular Enter al final
        setTimeout(() => {
            const event = new KeyboardEvent('keypress', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13
            });
            this.scannerInput.dispatchEvent(event);
        }, randomCode.length * 50);
    }

    handleKeyDown(event) {
        // Detectar tecla "Enter" como fin de escaneo
        if (event.key === 'Enter') {
            event.preventDefault();
            this.logDebug('✓ Enter detectado en handleKeyDown', 'event');
            
            if (this.scanBuffer.trim()) {
                this.processScan(this.scanBuffer.trim());
            }
            
            this.scanBuffer = '';
            this.scannerInput.value = '';
            return;
        }

        // Ignorar teclas especiales que no sean caracteres imprimibles
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }

        // Acumular caracteres
        if (event.key.length === 1) {
            event.preventDefault();
            
            // Limpiar buffer si han pasado más de SCAN_TIMEOUT ms
            const now = Date.now();
            if (now - this.lastKeyTime > this.SCAN_TIMEOUT && this.scanBuffer) {
                this.logDebug(`Buffer reset (pausa > ${this.SCAN_TIMEOUT}ms)`, 'event');
                this.scanBuffer = '';
            }
            
            this.lastKeyTime = now;
            this.scanBuffer += event.key;
            this.scannerInput.value = this.scanBuffer;
            this.logDebug(`Carácter acumulado: "${event.key}" | Buffer actual: "${this.scanBuffer}"`, 'event');

            // Limpiar timeout anterior
            clearTimeout(this.scanTimeout);
            
            // Si no hay más caracteres en 200ms, asumir fin del escaneo
            this.scanTimeout = setTimeout(() => {
                if (this.scanBuffer.trim()) {
                    this.processScan(this.scanBuffer.trim());
                    this.scanBuffer = '';
                    this.scannerInput.value = '';
                }
            }, 200);
        }
    }

    handleInput(event) {
        // Este método maneja el evento 'input' que disparan algunos scanners
        const value = this.scannerInput.value.trim();
        this.logDebug(`📥 Evento input disparado | Valor: "${value}"`, 'event');
        
        if (value && value.length > 0) {
            // Detectar si termina con Enter o si tiene un patrón común de scanner
            if (event.inputType === 'insertText' && event.data === '\n') {
                // Scanner terminó con Enter
                this.logDebug(`✓ Detectado Enter en evento input`, 'event');
                this.processScan(value.replace(/\n/, ''));
                this.scannerInput.value = '';
            } else if (value.length >= 6) {
                // Si tiene al menos 6 caracteres, podría ser un código válido
                // Esperar a ver si hay más entrada
                clearTimeout(this.scanTimeout);
                this.scanTimeout = setTimeout(() => {
                    if (this.scannerInput.value.trim()) {
                        this.processScan(this.scannerInput.value.trim());
                        this.scannerInput.value = '';
                    }
                }, 150);
            }
        }
    }

    handleKeyPress(event) {
        // Detectar Enter en el input del scanner
        if (event.key === 'Enter' || event.code === 'Enter') {
            event.preventDefault();
            const value = this.scannerInput.value.trim();
            this.logDebug(`⏎ Evento keypress con Enter detectado | Valor: "${value}"`, 'event');
            if (value) {
                this.processScan(value);
            }
            this.scannerInput.value = '';
        }
    }

    processScan(code) {
        this.logDebug(`✅ ESCANEO PROCESADO: "${code}"`, 'scan');
        
        const now = new Date();
        const scan = {
            code: code,
            timestamp: now.toLocaleString('es-ES'),
            time: now.toLocaleTimeString('es-ES'),
            id: Date.now()
        };

        // Agregar al historial
        this.scanHistory.unshift(scan);
        
        // Limitar historial a 100 escaneos
        if (this.scanHistory.length > 100) {
            this.scanHistory.pop();
        }

        // Guardar en localStorage
        this.saveHistory();

        // Actualizar UI
        this.updateLastScan(scan);
        this.updateHistory();
        this.updateStats();

        // Reproducir sonido (opcional)
        this.playSound();

        // Log
        console.log('✓ Escaneo detectado:', code);
    }

    updateLastScan(scan) {
        this.lastScanDisplay.innerHTML = `
            <div>
                <div class="scan-display-item">
                    <span class="code-value">${this.escapeHtml(scan.code)}</span>
                    <span class="code-time">${scan.timestamp}</span>
                </div>
            </div>
        `;
    }

    updateHistory() {
        if (this.scanHistory.length === 0) {
            this.historyList.innerHTML = '<p class="empty-state">Sin escaneos aún</p>';
            return;
        }

        this.historyList.innerHTML = this.scanHistory
            .map((scan, index) => `
                <div class="history-item ${index === 0 ? 'new' : ''}">
                    <div class="item-code">${this.escapeHtml(scan.code)}</div>
                    <div class="item-time">${scan.timestamp}</div>
                </div>
            `)
            .join('');
    }

    updateStats() {
        this.totalScansSpan.textContent = this.scanHistory.length;
        
        if (this.scanHistory.length > 0) {
            this.lastTimeSpan.textContent = this.scanHistory[0].time;
        }
    }

    clearHistory() {
        if (confirm('¿Está seguro que desea limpiar el historial?')) {
            this.scanHistory = [];
            this.saveHistory();
            this.updateHistory();
            this.updateStats();
            this.lastScanDisplay.innerHTML = '<p class="empty-state">Esperando escaneo...</p>';
            this.lastTimeSpan.textContent = '--:--:--';
            console.log('Historial limpiado');
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('scanHistory', JSON.stringify(this.scanHistory));
        } catch (e) {
            console.error('Error al guardar historial:', e);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('scanHistory');
            if (saved) {
                this.scanHistory = JSON.parse(saved);
                this.updateHistory();
                this.updateStats();
            }
        } catch (e) {
            console.error('Error al cargar historial:', e);
        }
    }

    playSound() {
        // Crear un beep simple con Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Algunos navegadores pueden no permitir audio
            console.debug('Audio no disponible');
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const scanner = new ScannerManager();
    console.log('🔍 Aplicación de Scanner PDA iniciada');
    console.log('💡 Consejo: Haga clic en la página y presione el botón de escaneo del PDA');
});

// Exports para uso en consola si es necesario
window.ScannerManager = ScannerManager;
