class ScannerManager {
    constructor() {
        this.scanHistory = [];
        this.scannerInput = document.getElementById('scannerInput');
        this.lastScanDisplay = document.getElementById('lastScan');
        this.historyList = document.getElementById('historyList');
        this.clearBtn = document.getElementById('clearBtn');
        this.totalScansSpan = document.getElementById('totalScans');
        this.lastTimeSpan = document.getElementById('lastTime');
        
        this.scanBuffer = '';
        this.lastKeyTime = 0;
        this.scanTimeout = null;
        this.SCAN_TIMEOUT = 100; // ms - tiempo máximo entre caracteres del scanner
        
        this.init();
    }

    init() {
        // Event listeners para el scanner
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        // Listener para cambios en el input (algunos scanners usan este evento)
        this.scannerInput.addEventListener('input', (e) => this.handleInput(e));
        // Listener para Enter en el input
        this.scannerInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        
        this.clearBtn.addEventListener('click', () => this.clearHistory());
        
        // Auto-focus en el input
        this.scannerInput.focus();
        
        // Re-focus si se pierde
        document.addEventListener('click', () => {
            this.scannerInput.focus();
        });

        // Cargar historial del localStorage
        this.loadHistory();
    }

    handleKeyDown(event) {
        // Detectar tecla "Enter" como fin de escaneo
        if (event.key === 'Enter') {
            event.preventDefault();
            
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
                this.scanBuffer = '';
            }
            
            this.lastKeyTime = now;
            this.scanBuffer += event.key;
            this.scannerInput.value = this.scanBuffer;

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
        
        if (value && value.length > 0) {
            // Detectar si termina con Enter o si tiene un patrón común de scanner
            if (event.inputType === 'insertText' && event.data === '\n') {
                // Scanner terminó con Enter
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
            if (value) {
                this.processScan(value);
            }
            this.scannerInput.value = '';
        }
    }

    processScan(code) {
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
