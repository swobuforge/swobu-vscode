[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [Português](README.pt-BR.md) | [Bahasa Indonesia](README.id.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Українська](README.uk.md)

# [Swobu](https://swobu.com/) — routeur LLM et fournisseur de modèles pour VS Code

Gardez vos habitudes de développement. Choisissez les modèles qui les alimentent.

Utilisez une route Swobu comme modèle natif de VS Code, ou connectez Claude Code et Codex tout en gardant leurs interfaces officielles. Configurez une fois les fournisseurs et le repli dans Swobu : la route reste la même quand le modèle change.

Installez la Preview depuis [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=swobu.swobu), ou recherchez `swobu.swobu` dans VS Code. Un seul paquet indépendant de la plateforme prend en charge les hôtes d’extension locaux, WSL, Remote SSH et conteneurs de développement.

## Modèles dans VS Code

Ouvrez **Manage Language Models**, choisissez **Swobu**, puis une route. Swobu gère le choix du fournisseur et le repli. Les appels d’outils sont activés par défaut pour VS Code Agent.

![Sélectionnez dans VS Code la route Swobu nommée code.](assets/screenshots/model-picker.png)

## Garder Claude Code et Codex

Lancez **Swobu: Connect Claude Code** ou **Swobu: Connect Codex**, choisissez un espace de travail et continuez dans l’interface officielle. La commande de connexion existante de Swobu gère la configuration et la sécurité du remplacement.

## Pourquoi des routes ?

Un sélecteur de fournisseur change le modèle dans l’éditeur. Une route permet de modifier la capacité et le repli derrière une sélection stable. Gardez le client ; confiez le choix du fournisseur à Swobu.

![Après un échec planifié de la cible principale, la requête aboutit grâce à la cible de repli OpenAI.](assets/screenshots/fallback-proof.png)

## Bien démarrer

1. Ouvrez **Swobu: Set Up** et configurez l’accès aux modèles.
2. Créez une route pour votre travail.
3. Sélectionnez-la dans **Manage Language Models**, puis demandez à Agent de lire un fichier.
4. Ouvrez **Swobu: Open** pour examiner le trafic routé.

## Réglages des modèles

Choisissez une route dans **Swobu: Configure Model**. Les images et les outils proposent **Default**, **On**, **Off**. Le contexte et la sortie proposent des valeurs prédéfinies ou un entier positif personnalisé. **Reset overrides** rétablit immédiatement les valeurs par défaut sans redémarrage.

Par défaut : outils activés, images désactivées, 32 768 jetons d’entrée et 4 096 de sortie. Vous contrôlez ces capacités annoncées au client ; elles ne sont pas détectées automatiquement. Activez les images uniquement pour une route disposant d’un modèle adapté.

## Fournisseurs et fonctionnement

Configurez les capacités dans Swobu, notamment OpenRouter, Ollama, Bedrock, Azure ou des points de terminaison compatibles OpenAI. Les identifiants restent dans Swobu. VS Code envoie ses requêtes au processus local Swobu, qui gère connexions, nouvelles tentatives, repli et consommation. L’extension présente les routes comme des modèles et transmet les réponses en continu.

## Confidentialité et sécurité

Les requêtes, réponses et contenus d’outils transitent temporairement en mémoire ; l’extension ne les conserve ni ne les journalise et n’a pas d’émetteur de télémétrie distinct. Les propres paramètres de confidentialité de Swobu s’appliquent à son processus. Voir [PRIVACY.md](PRIVACY.md) et [SECURITY.md](SECURITY.md).

## Environnements distants, WSL et conteneurs

L’extension s’exécute sur l’hôte de l’espace de travail. L’adresse loopback désigne cet hôte : configurez Swobu du côté distant pour un espace distant. La qualification des paquets et les tests d’installation précèdent la publication.

## Dépannage

Après modification des routes, utilisez **Swobu: Refresh Models**. Si Swobu est indisponible, vérifiez l’adresse configurée au niveau machine. Consultez la sortie de connexion avant d’autoriser le remplacement de configuration.

[Signalez un problème](https://github.com/swobuforge/swobu-vscode/issues) en indiquant version de VS Code, plateforme et message d’erreur, sans identifiants ni requêtes privées.

## Développement et licence

Node 22 et VS Code 1.136 ou ultérieur : `npm ci`, `npm test`, `npm run build`, `npm run package`. Avec une installation Swobu ordinaire compatible, exécutez aussi `npm run test:integration` ; sous Linux sans écran, utilisez `xvfb-run -a`.

Extension : [MIT](LICENSE). Swobu est installé et licencié séparément ; le VSIX ne contient aucun exécutable Swobu. Swobu n’est affilié ni à Microsoft, ni à Anthropic, ni à OpenAI.
