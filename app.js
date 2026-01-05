/**
 * SCANNER UROVO DT50 - VERSIÓN ESTABLE PDA
 * Keyboard Wedge 100% compatible
 */

class ScannerApp {
    constructor() {
        this.input = document.getElementById('scannerInput');
        this.focusBtn = document.getElementById('focusBtn');
        this.lastScan = document.getElementById('lastScan');
        this.historyList = document.getElementById('historyList');
        this.clearBtn = document.getElementById('clearBtn');
        this.totalScans = document.getElementById('totalScans');
        this.lastTime = document.getElementById('lastTime');
        this.debugLog = document.getElementById('debugLog');

        this.history = [];
        this.buffer = '';
        this.lastKeyTime = 0;

        this.init();
    }

    init() {
        this.log('✅ Scanner PDA iniciado', 'success');
        this.log('📱 UROVO DT50 - Keyboard Wedge', 'info');

        this.forceFocus();

        // 🔥 EVENTO CLAVE: keydown SOLO EN EL INPUT
        this.input.addEventListener('keydown', (e) => {
            const now = Date.now();

            // Reset buffer si hay pausa (scanner envía muy rápido)
            if (now - this.lastKeyTime > 100) {
                this.buffer = '';
            }
            this.lastKeyTime = now;

            // ENTER = fin de escaneo
            if (e.key === 'Enter' || e.keyCode === 13) {
                const code = this.buffer.trim();

                if (code.length > 0) {
                    this.processScan(code);
                }

                this.buffer = '';
                this.input.value = '';
                return;
            }

            // Ignorar teclas especiales
            if (e.key.length === 1) {
                this.buffer += e.key;
            }
        });

        this.focusBtn?.addEventListener('click', () => {
            this.input.focus();
            this.log('📌 Input enfocado manualmente', 'info');
        });

        this.clearBtn?.addEventListener('click', () => this.clearHistory());

        this.loadHistory();
        this.render();

        this.log('🚀 Listo para escanear', 'success');
    }

    forceFocus() {
        this.input.focus();

        setInterval(() => {
            if (document.activeElement !== this.input) {
                this.input.focus();
            }
        }, 800);

        document.addEventListener('click', () => this.input.focus());
    }

    processScan(code) {
        const now = new Date();
        const scan = {
            code,
            time: now.toLocaleTimeString('es-ES'),
            fullTime: now.toLocaleString('es-ES'),
            ts: now.getTime()
        };

        this.history.unshift(scan);
        if (this.history.length > 100) this.history.pop();

        this.saveHistory();
        this.render();
        this.beep();

        this.log(`📦 Escaneado: ${code}`, 'scan');
    }

    render() {
        if (this.history.length === 0) {
            this.lastScan.textContent = 'Esperando escaneo…';
            this.historyList.innerHTML = '';
            this.totalScans.textContent = '0';
            this.lastTime.textContent = '--:--:--';
            return;
        }

        const last = this.history[0];

        this.lastScan.innerHTML = `
            <div class="scan-code">${this.escapeHtml(last.code)}</div>
            <div class="scan-time">${last.fullTime}</div>
        `;

        this.totalScans.textContent = this.history.length;
        this.lastTime.textContent = last.time;

        this.historyList.innerHTML = this.history.map((h, i) => `
            <div class="history-item ${i === 0 ? 'new' : ''}">
                <div class="item-code">${this.escapeHtml(h.code)}</div>
                <div class="item-time">${h.fullTime}</div>
            </div>
        `).join('');
    }

    saveHistory() {
        localStorage.setItem('scannerHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const data = localStorage.getItem('scannerHistory');
        if (data) this.history = JSON.parse(data);
    }

    clearHistory() {
        if (!confirm('¿Limpiar historial?')) return;
        this.history = [];
        localStorage.removeItem('scannerHistory');
        this.render();
        this.log('🗑️ Historial limpiado', 'info');
    }

    beep() {
        try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.frequency.value = 900;
            gain.gain.value = 0.2;

            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } catch {}
    }

    escapeHtml(text) {
        return text.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#039;'
        }[m]));
    }

    log(msg, type = 'info') {
        if (!this.debugLog) return;
        const d = document.createElement('div');
        d.className = `debug-entry ${type}`;
        d.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        this.debugLog.appendChild(d);
        this.debugLog.scrollTop = this.debugLog.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ScannerApp();
});
