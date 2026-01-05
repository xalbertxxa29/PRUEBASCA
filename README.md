# Scanner PDA UROVO DT50 - Guía de Solución de Problemas

## 🚀 Características

- Panel de diagnóstico integrado en la web
- Registro en tiempo real de eventos del scanner
- Botón de prueba para simular escaneos
- Historial de escaneos con almacenamiento local

## 🔧 Panel de Diagnóstico

La web ahora incluye un **Panel de Diagnóstico** en la parte inferior que muestra:

### Información que se registra:
- ✅ **Eventos de teclado** - Cada tecla presionada
- ✅ **Eventos de entrada** - Cambios en el campo de input
- ✅ **Eventos de teclado especial** - Enter, teclas de control
- ✅ **Escaneos procesados** - Códigos que se capturaron exitosamente
- ✅ **Errores** - Cualquier problema detectado

### Botones disponibles:
1. **Minimizar/Maximizar** - Oculta o muestra el panel de debug
2. **Limpiar Log** - Limpia el registro de eventos
3. **Prueba de Scanner** - Simula un escaneo para verificar que todo funciona

## 🔍 Cómo usar para diagnosticar problemas

### Paso 1: Abre la web en tu UROVO DT50
- Abre esta página en el navegador del PDA
- Haz clic en la página para asegurar que está enfocada

### Paso 2: Presiona el botón de scanner
- Presiona el botón de scanner físico del UROVO DT50
- Observa el **Panel de Diagnóstico** en la parte inferior

### Paso 3: Analiza los mensajes
- Si ves eventos de teclado (⌨️) → El scanner **SÍ está enviando datos**
- Si ves "Enter detectado" → El scanner **termina con Enter**
- Si ves "ESCANEO PROCESADO" → ¡**Todo funciona perfectamente!**
- Si **NO ves nada** → Problema de conexión del scanner

## 📋 Problemas comunes y soluciones

### Problema 1: No aparece nada en el Panel de Diagnóstico
**Posible causa:** El scanner no está conectado o no está habilitado
**Soluciones:**
1. Verifica que el scanner esté habilitado en los ajustes del PDA
2. Prueba con el botón "Prueba de Scanner" para verificar que la web funciona
3. Asegúrate de hacer clic en el área de input antes de usar el scanner

### Problema 2: Aparecen eventos de teclado pero no se procesa el escaneo
**Posible causa:** El scanner no envía Enter al final, o necesita configuración especial
**Soluciones:**
1. Verifica la configuración del scanner en el PDA
2. Algunos scanners UROVO requieren activar el "modo de envío de datos"
3. Consulta el manual del UROVO DT50 para la configuración de salida

### Problema 3: El campo se llena pero desaparece después
**Posible causa:** El scanner envía datos pero no tiene suficiente tiempo antes de borrar
**Soluciones:**
1. El timeout de detección está en 200ms - esto es normal
2. Verifica en el log si dice "ESCANEO PROCESADO"

## 🧪 Botón de Prueba

Haz clic en **"Prueba de Scanner"** para:
- Simular un escaneo completo
- Verificar que el sistema de entrada funciona
- Probar sin el scanner físico

Si funciona la prueba pero no el scanner físico → Problema con el hardware/configuración del PDA

## 📱 Configuración del UROVO DT50

Si el scanner sigue sin funcionar, verifica estos ajustes en el PDA:

1. **Ajustes del Scanner**
   - Activa el scanner (si está deshabilitado)
   - Busca "Scanner Settings" o "Barcode Reader"

2. **Modo de Salida**
   - Debe estar en modo "Keyboard" (emula teclado)
   - NO en "USB" ni "Serial" si usas navegador web

3. **Terminador de Escaneo**
   - Debe estar configurado para enviar "Enter" al final
   - Algunos modelos lo llaman "Terminator" o "End Character"

## 🆘 Si nada funciona

1. **Prueba con un teclado USB:**
   - Si un teclado externo funciona → Problema específico del scanner
   - Si nada funciona → Problema con la web o navegador

2. **Intenta en otro navegador:**
   - Prueba con Chrome, Firefox, o el navegador por defecto del PDA

3. **Reinicia el PDA:**
   - A veces ayuda reiniciar el dispositivo

## 📞 Información del dispositivo

**Dispositivo:** UROVO DT50  
**Tipo:** PDA Industrial  
**Conectividad:** Scanner integrado  
**Salida esperada:** Emulación de teclado (Keyboard)

---

**Nota:** El Panel de Diagnóstico es tu mejor herramienta para entender qué está pasando. Úsalo para diagnosticar el problema antes de asumir que la web no funciona.
