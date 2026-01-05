/**
 * SCANNER UROVO DT50 - VERSIÓN OPTIMIZADA
 * 
 * REGLAS CRÍTICAS:
 * 1. El UROVO DT50 es un TECLADO WEDGE (emula teclado)
 * 2. NO usar event.preventDefault() en keydown (bloquea el scanner)
 * 3. NO usar APIs de JavaScript (no existen en el navegador)
 * 4. Mantener SIEMPRE el focus en el input
 * 5. Solo usar: input + keypress + localStorage
 */

class ScannerApp {
    constructor() {
        // Elementos del DOM
        this.input = document.getElementById('scannerInput');
        this.focusBtn = document.getElementById('focusBtn');
        this.lastScan = document.getElementById('lastScan');
        this.historyList = document.getElementById('historyList');
        this.clearBtn = document.getElementById('clearBtn');
        this.totalScans = document.getElementById('totalScans');
        this.lastTime = document.getElementById('lastTime');
        
        // Panel de debug
        this.debugLog = document.getElementById('debugLog');
        
        // Data
        this.history = [];
        
        this.init();
    }

    init() {
        this.log('✅ Aplicación iniciada', 'success');
        this.log('⚠️ IMPORTANTE: El UROVO DT50 es un Teclado Wedge', 'info');
        this.log('ℹ️ Solo necesitas hacer focus en el input y presionar el scanner', 'info');
        
        // PASO 1: Mantener focus permanentemente (CRÍTICO)
        this.keepFocus();
        this.log('📍 Sistema de focus permanente ACTIVADO', 'success');
        
        // PASO 2: Solo detectar ENTER en el input (No en keydown global)
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const code = this.input.value.trim();
                this.log(`🔹 Código escaneado: "${code}"`, 'scan');
                
                if (code.length > 0) {
                    this.processScan(code);
                }
                
                // Limpiar input
                this.input.value = '';
                this.input.focus();
            }
        });
        
        // PASO 3: Listener del input (para ver en tiempo real)
        this.input.addEventListener('input', (e) => {
            const value = this.input.value;
            if (value.length > 0) {
                this.log(`⌨️ Escribiendo: "${value}"`, 'event');
            }
        });
        
        // PASO 4: Botón de focus
        if (this.focusBtn) {
            this.focusBtn.addEventListener('click', () => {
                this.input.focus();
                this.log('👉 Input enfocado (haz clic aquí si pierdes el focus)', 'info');
            });
        }
        
        // PASO 5: Limpiar historial
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearHistory());
        }
        
        // PASO 6: Cargar datos guardados
        this.loadHistory();
        this.render();
        
        this.log('🚀 Sistema LISTO - Presiona el botón de scanner del PDA', 'success');
    }

    /**
     * Mantiene el focus en el input de forma permanente
     * Esto es CRÍTICO para que el UROVO DT50 funcione
     */
    keepFocus() {
        // Focus inicial
        this.input.focus();
        
        // Re-focus cada 500ms si se pierde
        setInterval(() => {
            if (document.activeElement !== this.input) {
                this.input.focus();
            }
        }, 500);
        
        // Re-focus al hacer clic en cualquier parte de la página
        document.addEventListener('click', () => {
            this.input.focus();
        });
        
        // Re-focus al presionar cualquier tecla
        document.addEventListener('keydown', () => {
            if (document.activeElement !== this.input) {
                this.input.focus();
            }
        });
    }

    /**
     * Procesa un código escaneado
     */
    processScan(code) {
        const now = new Date();
        const scan = {
            code: code,
            time: now.toLocaleTimeString('es-ES'),
            fullTime: now.toLocaleString('es-ES'),
            timestamp: now.getTime()
        };

        // Agregar al historial
        this.history.unshift(scan);
        
        // Limitar a 100 escaneos
        if (this.history.length > 100) {
            this.history.pop();
        }

        // Guardar en localStorage
        this.saveHistory();
        
        // Actualizar UI
        this.render();
        
        // Reproducir beep
        this.beep();
        
        this.log(`✅ ESCANEO GUARDADO: "${code}"`, 'success');
    }

    /**
     * Reproduce un beep de sonido
     */
    beep() {
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
            console.debug('Audio no disponible');
        }
    }

    /**
     * Renderiza la UI
     */
    render() {
        if (this.history.length === 0) {
            this.lastScan.textContent = 'Esperando escaneo…';
            this.historyList.innerHTML = '';
            this.totalScans.textContent = '0';
            this.lastTime.textContent = '--:--:--';
            return;
        }

        const last = this.history[0];
        
        // Último escaneo
        this.lastScan.innerHTML = `
            <div>
                <div class="scan-code">${this.escapeHtml(last.code)}</div>
                <div class="scan-time">${last.fullTime}</div>
            </div>
        `;
        
        // Estadísticas
        this.totalScans.textContent = this.history.length;
        this.lastTime.textContent = last.time;

        // Historial
        this.historyList.innerHTML = this.history
            .map((h, i) => `
                <div class="history-item ${i === 0 ? 'new' : ''}">
                    <div class="item-code">${this.escapeHtml(h.code)}</div>
                    <div class="item-time">${h.fullTime}</div>
                </div>
            `)
            .join('');
    }

    /**
     * Guarda el historial en localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('scannerHistory', JSON.stringify(this.history));
            this.log('💾 Historial guardado', 'info');
        } catch (e) {
            this.log(`❌ Error al guardar: ${e.message}`, 'error');
        }
    }

    /**
     * Carga el historial desde localStorage
     */
    loadHistory() {
        try {
            const data = localStorage.getItem('scannerHistory');
            if (data) {
                this.history = JSON.parse(data);
                this.log(`📂 Historial cargado: ${this.history.length} escaneos`, 'info');
            }
        } catch (e) {
            this.log(`❌ Error al cargar: ${e.message}`, 'error');
        }
    }

    /**
     * Limpia el historial
     */
    clearHistory() {
        if (confirm('¿Está seguro que desea limpiar el historial?')) {
            this.history = [];
            localStorage.removeItem('scannerHistory');
            this.render();
            this.log('🗑️ Historial limpiado', 'info');
            this.input.focus();
        }
    }

    /**
     * Escapa caracteres HTML para seguridad
     */
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

    /**
     * Log en el panel de debug
     */
    log(message, type = 'info') {
        if (!this.debugLog) return;
        
        const timestamp = new Date().toLocaleTimeString('es-ES');
        const entry = document.createElement('div');
        entry.className = `debug-entry ${type}`;
        entry.textContent = `[${timestamp}] ${message}`;
        
        this.debugLog.appendChild(entry);
        
        // Auto-scroll
        this.debugLog.parentElement.scrollTop = this.debugLog.parentElement.scrollHeight;
        
        // Limitar a 30 mensajes
        const entries = this.debugLog.querySelectorAll('.debug-entry');
        if (entries.length > 30) {
            entries[0].remove();
        }
    }
}

// Inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new ScannerApp();
    console.log('✅ Scanner UROVO DT50 - Sistema iniciado');
});

