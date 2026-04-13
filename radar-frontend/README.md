# Radar Científico — Frontend

Interface React + Vite para o Radar Científico, conectada ao Google Apps Script como backend.

## Estrutura

```
src/
├── lib/
│   └── api.js              ← Cliente HTTP (todas as chamadas ao GAS)
├── components/
│   ├── Sidebar.jsx         ← Navegação lateral
│   └── Toast.jsx           ← Notificações globais
├── pages/
│   ├── AuthPage.jsx        ← Login / Cadastro
│   ├── DashboardPage.jsx   ← Visão geral + stats
│   ├── MonitorsPage.jsx    ← Criar/editar/executar monitores
│   ├── PublicationsPage.jsx← Feed de artigos + filtros + notas + export
│   ├── NotesPage.jsx       ← Notas e coleções
│   └── AdminPage.jsx       ← Painel administrativo
├── App.jsx                 ← Router + auth guard
├── main.jsx                ← Entry point
└── index.css               ← Design system completo (Lab Noir)
```

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variável de ambiente
cp .env.example .env
# Edite .env e cole a URL do seu Web App do Apps Script

# 3. Rodar em desenvolvimento
npm run dev
```

## Deploy no GitHub Pages

```bash
# 1. Build
npm run build

# 2. O output fica em /dist — faça push desse diretório para o GitHub Pages
# Opção recomendada: use a action gh-pages

npm install --save-dev gh-pages
```

Adicione ao `package.json`:
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

```bash
npm run deploy
```

## Configuração do Backend (Apps Script)

1. Abra o Apps Script em script.google.com
2. Cole o conteúdo de `radar-cientifico-api.gs`
3. Execute `setupSpreadsheet()` para criar as abas
4. Vá em **Implantar → Nova implantação**:
   - Tipo: **App da Web**
   - Executar como: **Eu**
   - Quem tem acesso: **Qualquer pessoa**
5. Copie a URL gerada
6. Cole em `.env` na variável `VITE_API_URL`

## Design System (Lab Noir)

- **Fundo:** `#080d14` (quase preto, navy profundo)
- **Acento:** `#f0a500` (âmbar/ouro — contraste alto, científico)
- **Teal:** `#3dd6c8` (source badges, destaques secundários)
- **Fontes:** DM Serif Display (títulos) + DM Sans (corpo)
- **Bordas:** 1px solid `rgba(255,255,255,0.07)`

## Credenciais padrão

```
Email: admin@radar.app
Senha: admin123
```

⚠️ Altere a senha após o primeiro login em produção.
