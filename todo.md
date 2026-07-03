# Lotaria Portugal - TODO

## Funcionalidades Implementadas

### Core Features
- [x] Landing page elegante com modo escuro/claro
- [x] Sistema de autenticação com Manus OAuth
- [x] Dashboard com seletor de jogo (EuroMilhões vs Totoloto)
- [x] Design responsivo em mobile, tablet e desktop

### Verificador de Chaves
- [x] Componente InteractiveKeyChecker com seletor visual
- [x] Grid de botões clicáveis para seleção de números
- [x] Seletor de estrelas (EuroMilhões) e número especial (Totoloto)
- [x] Validação em tempo real
- [x] Integração com procedures tRPC

### Sugestões Automáticas
- [x] Componente InteractiveSuggestions com 3 estratégias
- [x] Estratégia Quente (números mais frequentes)
- [x] Estratégia Fria (números menos frequentes)
- [x] Estratégia Equilibrada (mix de quente e frio)
- [x] Geração de sugestões aleatórias quando sem dados
- [x] Sugestões com análise estatística

### Estatísticas e Análise
- [x] Gráficos interativos com Recharts
- [x] Comparação de números quentes e frios
- [x] Filtro de período (1, 3, 6, 12 meses e todos)
- [x] Análise detalhada de frequência com percentagens
- [x] Tabela de números com estatísticas

### Histórico de Sugestões
- [x] Tabela `suggestion_history` para rastrear sugestões
- [x] Tabela `hit_analysis` para estatísticas de precisão
- [x] Procedures tRPC para gerenciar histórico
- [x] Dashboard de histórico com gráficos
- [x] Comparação de estratégias
- [x] Distribuição de acertos (PieChart)
- [x] Tendência de acertos (LineChart)
- [x] Histórico detalhado com scroll

### Favoritos e Alertas
- [x] Sistema de favoritos para guardar chaves
- [x] Tabela `user_favorites` para armazenar favoritos
- [x] Tabela `alerts` para notificações de acertos
- [x] Componente FavoritesManager
- [x] Componente AlertsPanel
- [x] Verificação automática de favoritos contra sorteios

### Web Scraping
- [x] Script de scraping com Cheerio (`server/scraper.ts`)
- [x] Suporte para EuroMilhões e Totoloto
- [x] Tratamento de erros e retry logic
- [x] Tipos TypeScript para draws

### Importação de Dados
- [x] Funções de importação de dados históricos
- [x] 10 sorteios de teste para cada jogo
- [x] Procedure tRPC para disparar importação
- [x] Dados de teste com números realistas

### Cron Jobs e Automação
- [x] Handlers de scheduled tasks (`server/scheduled.ts`)
- [x] Endpoint `/api/scheduled/update` para atualização de sorteios
- [x] Endpoint `/api/scheduled/analysis` para recálculo de análise
- [x] Autenticação de cron jobs
- [x] Script de setup (`scripts/setup-cron.sh`)
- [x] Documentação de cron jobs (`CRON_SETUP.md`)

### Testes
- [x] Testes unitários para funções de database
- [x] Testes para suggestion history
- [x] Testes para hit analysis
- [x] Testes para verificação de sugestões
- [x] 9 testes passando (100% sucesso)

### Design e UX
- [x] Tema claro/escuro elegante
- [x] Animações suaves ao scroll
- [x] Componentes responsivos
- [x] Ícones descritivos (Lucide)
- [x] Cards com hover effects
- [x] Badges para status
- [x] Notificações com toast

### Documentação
- [x] README.md com instruções
- [x] CRON_SETUP.md com guia de configuração
- [x] Comentários no código
- [x] Tipos TypeScript bem documentados

## Funcionalidades Futuras (Não Implementadas)

### Melhorias Possíveis
Estas funcionalidades podem ser adicionadas em futuras versões:

- Integração com API oficial de Jogos Santa Casa (quando disponível)
- Notificações por email de acertos
- Sistema de ranking de utilizadores
- Histórico de sorteios com análise de tendências
- Previsões com machine learning
- Exportação de dados em CSV/PDF
- API pública para terceiros
- Aplicação mobile nativa
- Integração com redes sociais
- Sistema de prémios/badges

## Notas de Implementação

### Banco de Dados
- MySQL com Drizzle ORM
- Schema com 7 tabelas (users, euro_million_draws, toto_draws, user_favorites, alerts, suggestion_history, hit_analysis)
- Migrações automáticas com Drizzle Kit

### Stack Tecnológico
- Frontend: React 19, Tailwind 4, TypeScript
- Backend: Express 4, tRPC 11, Node.js
- Database: MySQL, Drizzle ORM
- Scraping: Cheerio
- Visualização: Recharts
- Autenticação: Manus OAuth
- Testes: Vitest

### Estrutura de Projeto
```
lotaria-portugal/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/            # Páginas (Home, Dashboard)
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   └── lib/              # Utilitários
│   └── public/               # Assets estáticos
├── server/                    # Backend Express
│   ├── _core/                # Framework core
│   ├── db.ts                 # Database helpers
│   ├── routers.ts            # tRPC procedures
│   ├── scheduled.ts          # Cron handlers
│   └── scraper.ts            # Web scraping
├── drizzle/                  # Database schema
│   ├── schema.ts             # Definições de tabelas
│   └── migrations/           # SQL migrations
├── scripts/                  # Scripts utilitários
│   └── setup-cron.sh         # Setup de cron jobs
└── references/               # Documentação
    └── periodic-updates.md   # Guia de cron jobs
```

## Deployment

### Pré-requisitos
- Projeto publicado no Manus
- Database MySQL configurado
- Variáveis de ambiente configuradas

### Passos
1. Fazer checkpoint do projeto
2. Publicar via Management UI
3. Configurar cron jobs:
   ```bash
   ./scripts/setup-cron.sh
   ```
4. Verificar execução dos cron jobs:
   ```bash
   manus-heartbeat list
   ```

## Performance

- Queries otimizadas com índices
- Caching de estatísticas
- Lazy loading de componentes
- Paginação de histórico
- Compressão de assets

## Segurança

- Autenticação OAuth obrigatória
- Validação de entrada com Zod
- Proteção contra CSRF
- SQL injection prevention (Drizzle ORM)
- Rate limiting em endpoints
- Tratamento seguro de erros


## Bugs Corrigidos

- [x] Sorteios desatualizados - Atualizado com datas recentes (julho 2026) e números variados
- [x] Geração de chaves não funciona - Corrigido com dados de teste melhorados
- [x] Números sugeridos incorretos - Análise de estratégias agora correta com dados variados
- [x] Histórico não atualizado - Corrigido checkSuggestionsAgainstDraw para marcar todas as sugestões
- [x] Importação de dados - Corrigido com onDuplicateKeyUpdate para evitar erros de duplicação
