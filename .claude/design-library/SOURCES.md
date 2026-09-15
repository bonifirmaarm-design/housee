# Источники скиллов

Всё в `.claude/skills/` и `.claude/design-library/` — сторонний код,
скопированный из публичных репозиториев. Авторство и лицензии — за авторами
репозиториев по ссылкам ниже.

| Репозиторий | Что взято |
|---|---|
| [anthropics/claude-code](https://github.com/anthropics/claude-code) `plugins/frontend-design` | `frontend-design` |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `ui-ux-pro-max`, `design`, `design-system`, `ui-styling`, `brand`, `banner-design` |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | `taste-skill`, `minimalist-skill`, `brutalist-skill`, `soft-skill`, `brandkit`, `image-to-code-skill`, `redesign-skill`, `output-skill`, `stitch-skill` (+ `design-library/taste-skill-extra/`) |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | `impeccable` |
| [nutlope/hallmark](https://github.com/nutlope/hallmark) | `hallmark` |
| [nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft) | `scroll-craft` |
| [img2threejs/img2threejs](https://github.com/img2threejs/img2threejs) | `img2threejs` |
| [Dammyjay93/interface-design](https://github.com/Dammyjay93/interface-design) | `interface-design` |
| [claudekit/frontend-design-pro-demo](https://github.com/claudekit/frontend-design-pro-demo) | `frontend-design-pro` |
| [LovroPodobnik/refactoring-ui-skill](https://github.com/LovroPodobnik/refactoring-ui-skill) | `ui-refactor` |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `web-design-guidelines`, `react-best-practices`, `composition-patterns`, `react-view-transitions`, `writing-guidelines`, `vercel-optimize`, `deploy-to-vercel` |
| [Owl-Listener/designer-skills](https://github.com/Owl-Listener/designer-skills) | 25 скиллов в `.claude/skills/`, полный каталог в `design-library/designer-skills/` |
| [wondelai/skills](https://github.com/wondelai/skills) | `ux-heuristics`, `design-sprint`, `top-design`, `refactoring-ui`, `web-typography`, `microinteractions`, `design-everyday-things`, `steve-jobs-design-review`, `create-website`, `improve-website`, `conversion-optimization`; полный каталог в `design-library/wondelai-skills/` |
| [bencium/bencium-marketplace](https://github.com/bencium/bencium-marketplace) | `typography`, `design-audit`, `bencium-impact-designer`, `bencium-innovative-ux-designer`, `bencium-controlled-ux-designer`, `renaissance-architecture`, `human-architect-mindset` |
| [rohitg00/awesome-claude-design](https://github.com/rohitg00/awesome-claude-design) | Скиллов не содержит. Взяты `design-md/` (стилевые семейства), `prompts/`, `recipes/` → `design-library/awesome-claude-design/` |

## Что не взято и почему

Из двух больших каталогов (Owl-Listener ~120 скиллов, wondelai ~90) в
активную папку попала только часть — иначе список скиллов раздувается и
перестаёт быть полезным. Остальное лежит в `design-library/` целиком
и читается через `Read`/`Grep` по необходимости.

Из `vercel-labs` пропущены `react-native-skills` и `vercel-cli-with-tokens` —
не относятся к задаче.
