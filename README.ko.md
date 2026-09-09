[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [Português](README.pt-BR.md) | [Bahasa Indonesia](README.id.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Українська](README.uk.md)

# [Swobu](https://swobu.com/) — VS Code용 LLM 라우터 및 모델 제공자

익숙한 개발 흐름을 유지하고, 그 뒤에서 실행할 모델을 선택하세요.

Swobu 경로를 VS Code 네이티브 모델로 사용하거나 공식 인터페이스를 유지하면서 Claude Code와 Codex를 연결하세요. Swobu에서 제공자와 대체 경로를 한 번 설정하면, 모델이 바뀌어도 같은 경로를 계속 선택할 수 있습니다.

[Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=swobu.swobu)에서 확장을 설치하거나 VS Code에서 `swobu.swobu`를 검색하세요. 하나의 플랫폼 독립 패키지가 로컬, WSL, Remote SSH 및 개발 컨테이너 확장 호스트를 지원합니다.

## VS Code에서 모델 사용

**Manage Language Models**를 열고 **Swobu**와 경로를 선택하세요. Swobu가 제공자 선택과 대체 처리를 관리합니다. VS Code Agent용 도구 호출은 기본적으로 켜져 있습니다.

## Claude Code와 Codex 유지

**Swobu: Connect Claude Code** 또는 **Swobu: Connect Codex**를 실행하고 작업 공간을 선택한 뒤 공식 인터페이스에서 계속 작업하세요. 기존 Swobu 연결 명령이 설정 변경과 안전한 교체를 담당합니다.

## 경로를 사용하는 이유

제공자 전환기는 편집기 안의 모델을 바꿉니다. 경로는 안정적인 모델 선택 뒤에서 처리 자원과 대체 옵션을 바꿀 수 있게 합니다. 클라이언트는 유지하고 제공자 결정은 Swobu에 맡기세요.

## 시작하기

1. **Swobu: Set Up**을 열어 모델 연결을 설정합니다.
2. 개발 작업용 경로를 만듭니다.
3. **Manage Language Models**에서 경로를 선택하고 Agent에 파일 읽기를 요청합니다.
4. **Swobu: Open**에서 라우팅된 요청을 확인합니다.

## 모델 설정

**Swobu: Configure Model**에서 경로를 선택합니다. 이미지와 도구 호출은 **Default**, **On**, **Off** 중 선택합니다. 컨텍스트 및 출력 제한에는 사전 설정이나 사용자 지정 양의 정수를 사용할 수 있습니다. **Reset overrides**는 다시 시작하지 않고 즉시 기본값을 복원합니다.

기본값: 도구 켜짐, 이미지 꺼짐, 입력 토큰 32,768개, 출력 토큰 4,096개. 이는 사용자가 관리하는 클라이언트 기능 선언이며 모델 자동 감지가 아닙니다. 이미지 지원 모델이 있는 경로에서만 이미지를 켜세요.

## 제공자와 작동 방식

OpenRouter, Ollama, Bedrock, Azure, OpenAI 호환 엔드포인트 등 사용 가능한 자원을 Swobu에서 설정합니다. 자격 증명은 Swobu에 보관됩니다. VS Code가 로컬 Swobu 프로세스로 요청을 보내면 Swobu가 연결, 재시도, 대체 처리 및 사용량을 관리합니다. 확장은 경로를 모델로 표시하고 응답을 스트리밍합니다.

## 개인정보 및 보안

요청, 응답, 도구 내용은 확장 메모리를 일시적으로 통과합니다. 확장은 해당 내용을 저장하거나 기록하지 않으며 별도 원격 분석 업로더도 없습니다. Swobu 런타임에는 자체 개인정보 설정이 적용됩니다. [PRIVACY.md](PRIVACY.md), [SECURITY.md](SECURITY.md)를 참고하세요.

## 원격, WSL 및 컨테이너

확장은 작업 공간 확장 호스트에서 실행됩니다. 루프백 주소는 해당 호스트를 가리키므로 원격 작업 공간에서는 원격 측에 Swobu를 설정하세요. 플랫폼 패키지 검증과 설치 테스트는 릴리스 전제 조건입니다.

## 문제 해결

경로를 변경한 뒤 **Swobu: Refresh Models**를 실행하세요. Swobu에 연결할 수 없다면 컴퓨터 수준 엔드포인트를 확인하세요. 설정 교체를 허용하기 전에 연결 명령 출력을 읽어보세요.

[문제 보고](https://github.com/swobuforge/swobu-vscode/issues)에 VS Code 버전, 플랫폼, 오류 메시지를 포함하되 자격 증명과 비공개 요청 내용은 제외하세요.

## 개발 및 라이선스

Node 22, VS Code 1.136 이상에서 `npm ci`, `npm test`, `npm run build`, `npm run package`를 실행합니다. 호환되는 일반 Swobu 설치가 있으면 `npm run test:integration`도 실행하고, 화면 없는 Linux에서는 `xvfb-run -a`를 사용하세요.

확장 소스는 [MIT](LICENSE)입니다. Swobu는 별도로 설치 및 라이선스되며 VSIX에는 Swobu 실행 파일이 없습니다. Swobu는 Microsoft, Anthropic, OpenAI와 제휴하지 않습니다.
