# Lotaria Portugal - TODO

## Fase 1: Base de Dados e Backend
- [x] Criar tabelas Drizzle para EuroMilhões (5 números + 2 estrelas)
- [x] Criar tabelas Drizzle para Totoloto (6 números + 1 número especial)
- [x] Gerar e aplicar migrações SQL
- [x] Implementar funções de query no server/db.ts

## Fase 2: API e Procedures tRPC
- [x] Criar procedures para obter estatísticas (total sorteios, números mais/menos frequentes)
- [x] Criar procedure para verificar se chave foi sorteada
- [x] Criar procedure para obter histórico paginado de sorteios
- [x] Criar procedure para sugerir chaves (estratégias: quente, fria, equilibrada)
- [x] Criar procedure para análise de tendências (frequência por período)

## Fase 3: Interface e Design
- [x] Implementar design elegante com tipografia limpa e espaçamento generoso
- [x] Criar seletor de jogo (EuroMilhões vs Totoloto) na página principal
- [x] Integrar ícones oficiais do EuroMilhões e Totoloto
- [x] Criar layout responsivo e sofisticado

## Fase 4: Componentes Principais
- [x] Componente GameSelector (seletor de jogo com ícones)
- [x] Componente Statistics (estatísticas gerais do jogo)
- [x] Componente KeyChecker (verificador de chaves)
- [x] Componente DrawHistory (histórico paginado)
- [x] Componente KeySuggester (sugestões automáticas com estratégias)
- [x] Componente TrendAnalysis (gráfico de frequências)

## Fase 5: Funcionalidades Avançadas
- [x] Implementar verificação de chaves com feedback visual
- [x] Implementar paginação do histórico
- [x] Implementar sugestões com indicação clara da estratégia
- [x] Implementar gráficos de tendências com período configurável
- [x] Adicionar validação de números por jogo

## Fase 6: Dados e Testes
- [x] Importar dados de sorteios históricos (EuroMilhões e Totoloto)
- [x] Criar testes vitest para funções críticas
- [x] Testar fluxos de utilizador principais
- [x] Validar cálculos de estatísticas

## Fase 7: Entrega Final
- [x] Otimizações de performance
- [x] Verificação de acessibilidade
- [x] Testes cross-browser
- [x] Criar checkpoint final
