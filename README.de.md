[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [Português](README.pt-BR.md) | [Bahasa Indonesia](README.id.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Українська](README.uk.md)

# [Swobu](https://swobu.com/) — LLM-Router und Modellanbieter für VS Code

Behalte deinen Entwicklungsablauf. Wähle die Modelle dahinter.

Nutze eine Swobu-Route als natives VS-Code-Modell oder verbinde Claude Code und Codex mit ihren offiziellen Oberflächen. Konfiguriere Anbieter und Fallback einmal in Swobu; die gewählte Route bleibt gleich, wenn sich das Modell dahinter ändert.

Installiere die Erweiterung aus dem [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=swobu.swobu) oder suche in VS Code nach `swobu.swobu`. Ein plattformunabhängiges Paket unterstützt lokale, WSL-, Remote-SSH- und Dev-Container-Erweiterungshosts.

## Swobu-Modelle in VS Code

Öffne **Manage Language Models**, wähle **Swobu** und anschließend eine Route. Swobu übernimmt Anbieterauswahl und Fallback. Werkzeugaufrufe für VS Code Agent sind standardmäßig aktiviert.

## Claude Code und Codex behalten

Führe **Swobu: Connect Claude Code** oder **Swobu: Connect Codex** aus, wähle einen Arbeitsbereich und arbeite in der offiziellen Oberfläche weiter. Der bestehende Swobu-Verbindungsbefehl übernimmt Konfiguration und sicheres Ersetzen.

## Warum Routen?

Ein Anbieterwechsel tauscht das Modell im Editor aus. Eine Route lässt dich Modellkapazität und Fallback hinter einer stabilen Modellauswahl verändern. Der Client bleibt; die Anbieterentscheidung liegt bei Swobu.

## Erste Schritte

1. Öffne **Swobu: Set Up** und konfiguriere deinen Modellzugang.
2. Erstelle eine Route für deine Aufgaben.
3. Wähle sie in **Manage Language Models** und bitte den Agent, eine Datei zu lesen.
4. Öffne **Swobu: Open**, um den gerouteten Datenverkehr zu prüfen.

## Modelleinstellungen

Wähle deine Route unter **Swobu: Configure Model**. Für Bilder und Werkzeugaufrufe gibt es **Default**, **On** und **Off**. Kontext- und Ausgabelimits bieten Vorgaben und eigene positive ganze Zahlen. **Reset overrides** stellt die Standardwerte sofort ohne Neustart wieder her.

Standard: Werkzeuge an, Bilder aus, 32.768 Eingabe- und 4.096 Ausgabetokens. Diese Angaben steuerst du selbst; sie sind keine automatische Erkennung des zugrunde liegenden Modells. Aktiviere Bilder nur für bildfähige Routen.

## Anbieter und Funktionsweise

Konfiguriere Kapazität in Swobu, etwa OpenRouter, Ollama, Bedrock, Azure oder OpenAI-kompatible Endpunkte. Zugangsdaten bleiben in Swobu. VS Code sendet Anfragen an die lokale Swobu-Laufzeit. Diese übernimmt Verbindungen, Wiederholungen, Fallback und Verbrauchserfassung; die Erweiterung stellt Routen als Modelle dar und streamt Antworten zurück.

## Datenschutz und Sicherheit

Prompts, Antworten und Werkzeugdaten werden vorübergehend im Speicher der Erweiterung verarbeitet, nicht gespeichert oder protokolliert. Die Erweiterung hat keinen eigenen Telemetrie-Uploader. Für Swobu gelten dessen eigene Datenschutzeinstellungen. Siehe [PRIVACY.md](PRIVACY.md) und [SECURITY.md](SECURITY.md).

## Remote, WSL und Container

Die Erweiterung läuft auf dem Workspace-Host. Der Loopback-Endpunkt bezeichnet diesen Host; richte Swobu bei Remote-Arbeitsbereichen auf der entfernten Seite ein. Paketqualifizierung und Installationstests sind Veröffentlichungsvoraussetzungen.

## Hilfe

Aktualisiere nach Routenänderungen mit **Swobu: Refresh Models**. Prüfe bei fehlender Verbindung den maschinenbezogenen Endpunkt. Lies die Verbindungsausgabe, bevor du das Ersetzen von Konfiguration erlaubst.

[Melde ein Problem](https://github.com/swobuforge/swobu-vscode/issues) mit VS-Code-Version, Plattform und Fehlermeldung, ohne Zugangsdaten oder private Anfrageinhalte.

## Entwicklung und Lizenz

Node 22 und VS Code ab 1.135: `npm ci`, `npm test`, `npm run build`, `npm run package`. Führe mit einer kompatiblen normalen Swobu-Installation auch `npm run test:integration` aus; unter Linux ohne Display mit `xvfb-run -a`.

Erweiterung: [MIT](LICENSE). Swobu wird separat installiert und lizenziert; die VSIX enthält keine Swobu-Programmdatei. Swobu ist nicht mit Microsoft, Anthropic oder OpenAI verbunden.
