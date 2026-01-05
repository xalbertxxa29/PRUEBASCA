# Integración UROVO DT50 - SDK Scanner

## 📋 Información del SDK UROVO

Basado en el SDK_ReleaseforAndroid v4.2.0618:
- **Dispositivo:** UROVO DT50 (Handheld Data Terminal)
- **Versión mínima:** Android 4.3+
- **API Scanner:** ScanManager
- **Referencia:** https://github.com/urovosamples/SDK_ReleaseforAndroid

## 🎯 APIs de Scanner Soportadas

### 1. **ScanManager** (Principal - Recomendada)
```javascript
if (window.ScanManager) {
    window.ScanManager.startScan((result) => {
        const code = result.barcode;
        console.log('Código escaneado:', code);
    });
}
```

### 2. **Android Intent (Secundaria)**
```javascript
if (window.android && window.android.intentStartScan) {
    window.android.intentStartScan((code) => {
        console.log('Código escaneado:', code);
    });
}
```

### 3. **UROVO Bridge (JavascriptInterface)**
```javascript
if (window.UROVO && window.UROVO.Scanner) {
    window.UROVO.Scanner.open((result) => {
        console.log('Código escaneado:', result);
    });
}
```

### 4. **SCAN_REQUEST (Genérica)**
```javascript
if (window.SCAN_REQUEST) {
    window.SCAN_REQUEST((code) => {
        console.log('Código escaneado:', code);
    });
}
```

## 🔧 Configuración del UROVO DT50

Para que el scanner funcione en la web, debes configurar:

### En Ajustes del Dispositivo:
1. **Habilitar Scanner**
   - Ir a: Ajustes > Dispositivo > Scanner
   - Asegurar que está "Habilitado"

2. **Modo de Salida**
   - Modo: **Keyboard Emulation** (Emulación de Teclado) - **MUY IMPORTANTE**
   - Algunos modelos pueden tenerlo como "HID" o "Teclado"

3. **Carácter de Fin (Terminator)**
   - Debe enviar: **Enter** (carriage return)
   - Código ASCII: **13**

4. **Velocidad/Baudrate** (si aplica)
   - Seleccionar automático o 9600

### En la Aplicación Web:
- El campo de entrada (`scannerInput`) debe estar enfocado
- La web debe estar en foreground (visible)
- JavaScript debe estar habilitado

## ✅ Cómo Verificar que Funciona

### Paso 1: Abre la Web
```
Abre tu web en el navegador del UROVO DT50
```

### Paso 2: Presiona "Abrir Scanner"
```
Verás en el Panel de Diagnóstico:
- ✓ API ScanManager detectada
- ✓ Scanner abierto exitosamente
- O ⚠️ Sin API (requiere Keyboard Emulation)
```

### Paso 3: Presiona Botón de Scanner
```
Si está en modo Keyboard Emulation:
- Aparecerá el código en el input
- Se procesará automáticamente

Si no está configurado:
- No pasará nada
- Verás eventos en el Panel de Diagnóstico
```

## 📊 Panel de Diagnóstico

Muestra en tiempo real:
- ✓ Qué APIs están disponibles
- ⌨️ Cada evento de teclado
- ✅ Escaneos procesados
- ❌ Errores ocurridos

## 🚀 Flujo de Funcionamiento

```
┌─────────────────────────────────────┐
│ Presionar Botón de Scanner (Físico) │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  PDA Emite Datos (via Emulación)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Web Recibe Caracteres en Input      │
│ (evento keydown/input)              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Detecta Enter como Fin de Escaneo   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Procesa Código de Barras            │
│ - Guarda en historial               │
│ - Muestra en pantalla               │
│ - Actualiza estadísticas            │
└─────────────────────────────────────┘
```

## 🔍 Solución de Problemas

### ❌ El botón "Abrir Scanner" dice "Sin API Scanner"
**Causa:** El navegador WebView no tiene acceso a las APIs de UROVO
**Soluciones:**
1. Verifica que estés usando el navegador nativo del PDA
2. Usa Keyboard Emulation en lugar de API directa
3. Consulta la versión del firmware del UROVO

### ❌ La web recibe escaneos pero en desorden
**Causa:** El scanner envía datos demasiado rápido
**Solución:** El código ya maneja esto con timeouts de 100ms

### ❌ Funciona en desktop pero no en PDA
**Causa:** Las APIs (ScanManager) solo existen en el navegador del PDA
**Solución:** Es normal - las APIs son específicas del UROVO DT50

### ✅ El scanner funciona en Keyboard Emulation
**Lo ideal:** Usa este modo si no puedes usar las APIs
**Configuración:** Ajustes > Scanner > Modo: Keyboard Emulation

## 📚 Referencias

- SDK Repository: https://github.com/urovosamples/SDK_ReleaseforAndroid
- Documentación UROVO: Incluida en el SDK (carpeta API Reference)
- Ejemplos: Carpeta `Samples/ScanManager` en el SDK

## 💡 Recomendación

**Para máxima compatibilidad:**
1. **Primera opción:** Configura en Keyboard Emulation (funciona en cualquier web)
2. **Segunda opción:** Usa las APIs de ScanManager (mejor experiencia)
3. **Tercera opción:** Combina ambas (el código ya lo hace)

## 🎛️ Prueba Rápida

Antes de presionar el scanner físico:
1. Haz clic en "Prueba de Scanner"
2. Verifica que funciona el sistema
3. Luego intenta con el scanner real
