[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [Português](README.pt-BR.md) | [Bahasa Indonesia](README.id.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Українська](README.uk.md)

# [Swobu](https://swobu.com/) — enrutador LLM y proveedor de modelos para VS Code

Conserva tu forma de programar. Elige los modelos que la sustentan.

Usa una ruta Swobu como modelo nativo de VS Code o conecta Claude Code y Codex manteniendo sus interfaces oficiales. Configura proveedores y alternativas una vez en Swobu; la ruta sigue siendo la misma cuando cambia el modelo.

Instala la extensión desde [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=swobu.swobu) o busca `swobu.swobu` en VS Code. Un único paquete independiente de la plataforma funciona en hosts de extensión locales, WSL, Remote SSH y contenedores de desarrollo.

## Modelos en VS Code

Abre **Manage Language Models**, elige **Swobu** y selecciona una ruta. Swobu gestiona la selección del proveedor y la recuperación con alternativas. Las llamadas a herramientas están activadas por defecto para VS Code Agent.

## Conserva Claude Code y Codex

Ejecuta **Swobu: Connect Claude Code** o **Swobu: Connect Codex**, elige un espacio de trabajo y continúa en la interfaz oficial. El comando existente de Swobu gestiona la configuración y la sustitución segura.

## ¿Por qué rutas?

Un selector de proveedores cambia el modelo del editor. Una ruta permite cambiar capacidad y alternativas detrás de una selección estable. Conserva el cliente y traslada la decisión de proveedor a Swobu.

## Primeros pasos

1. Abre **Swobu: Set Up** y configura el acceso a modelos.
2. Crea una ruta para tu trabajo.
3. Selecciónala en **Manage Language Models** y pide al Agent que lea un archivo.
4. Abre **Swobu: Open** para examinar el tráfico enrutado.

## Ajustes del modelo

En **Swobu: Configure Model**, elige una ruta. Imágenes y herramientas ofrecen **Default**, **On**, **Off**. Contexto y salida ofrecen valores predefinidos o un entero positivo personalizado. **Reset overrides** restaura los valores inmediatamente, sin reiniciar.

Valores predeterminados: herramientas activadas, imágenes desactivadas, 32 768 tokens de entrada y 4 096 de salida. Tú controlas las capacidades anunciadas al cliente; no se detectan automáticamente. Activa imágenes solo para una ruta con un modelo compatible.

## Proveedores y funcionamiento

Configura capacidad en Swobu, como OpenRouter, Ollama, Bedrock, Azure o endpoints compatibles con OpenAI. Las credenciales permanecen en Swobu. VS Code envía solicitudes al proceso local Swobu, que gestiona conexiones, reintentos, alternativas y uso. La extensión presenta rutas como modelos y transmite las respuestas.

## Privacidad y seguridad

Solicitudes, respuestas y contenido de herramientas pasan temporalmente por la memoria. La extensión no los guarda ni registra y no tiene un emisor de telemetría independiente. Se aplican los ajustes de privacidad propios de Swobu. Consulta [PRIVACY.md](PRIVACY.md) y [SECURITY.md](SECURITY.md).

## Remoto, WSL y contenedores

La extensión se ejecuta en el host del espacio de trabajo. El endpoint loopback se refiere a ese host: configura Swobu en el lado remoto cuando corresponda. La validación de paquetes y las pruebas de instalación son requisitos previos al lanzamiento.

## Ayuda

Después de cambiar rutas, usa **Swobu: Refresh Models**. Si Swobu no está disponible, comprueba el endpoint configurado para la máquina. Revisa la salida de conexión antes de permitir sustituir la configuración.

[Comunica un problema](https://github.com/swobuforge/swobu-vscode/issues) con la versión de VS Code, plataforma y mensaje de error, sin credenciales ni solicitudes privadas.

## Desarrollo y licencia

Node 22 y VS Code 1.136 o posterior: `npm ci`, `npm test`, `npm run build`, `npm run package`. Con una instalación ordinaria compatible de Swobu, ejecuta también `npm run test:integration`; en Linux sin pantalla usa `xvfb-run -a`.

Extensión: [MIT](LICENSE). Swobu se instala y licencia por separado; el VSIX no contiene ningún ejecutable de Swobu. Swobu no está afiliado a Microsoft, Anthropic ni OpenAI.
