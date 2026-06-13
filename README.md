# Para sempre dois - MVP Front-End

Plataforma gratuita e sem fins lucrativos para criação de sites de casamento. MVP front-end com dados mockados.

## Como rodar

Abra um terminal na pasta do projeto e execute:

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev
```

Acesse: **http://localhost:5173**

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing Page |
| `/login` | Login / Cadastro |
| `/dashboard` | Dashboard do casal |
| `/templates` | Escolha de template |
| `/editor` | Editor do site |
| `/site/ana-e-pedro` | Página pública do casamento |

## Stack

- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- React Router DOM

## Estrutura

```text
src/
├── data/          # Dados mockados
├── context/       # AuthContext, WeddingContext
├── hooks/         # useLocalStorage
├── components/
│   ├── ui/        # Button, Input, Card, Badge, Modal
│   ├── layout/    # Navbar, Footer, Sidebar
│   └── shared/    # TemplateCard, Countdown, GiftCard
└── pages/
    ├── Landing/
    ├── Auth/
    ├── Dashboard/
    ├── Templates/
    ├── Editor/
    └── WeddingSite/
```
