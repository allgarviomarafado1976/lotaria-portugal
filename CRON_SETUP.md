# Configuração de Cron Jobs - Lotaria Portugal

Este documento explica como configurar os cron jobs para atualização automática de sorteios e análise de acertos.

## Pré-requisitos

1. **Projeto deve estar deployed** - Os cron jobs só funcionam com a aplicação publicada
2. **Acesso ao sandbox** - Você precisa ter acesso ao terminal do sandbox para executar os comandos

## Estrutura de Cron Jobs

A aplicação possui dois cron jobs principais:

### 1. Atualização Diária de Sorteios (09:00 UTC)
- **Endpoint**: `/api/scheduled/update`
- **Frequência**: Diariamente às 09:00 UTC
- **Função**: Verifica sugestões contra o último sorteio e atualiza análise de acertos

### 2. Atualização de Análise (10:00 UTC)
- **Endpoint**: `/api/scheduled/analysis`
- **Frequência**: Diariamente às 10:00 UTC
- **Função**: Recalcula estatísticas de precisão para todas as estratégias

## Como Configurar

### Opção 1: Usar o Script Automático (Recomendado)

```bash
# Execute o script de setup
./scripts/setup-cron.sh
```

Este script criará automaticamente ambos os cron jobs.

### Opção 2: Configurar Manualmente

```bash
# Cron job para atualização de sorteios
manus-heartbeat create \
  --name lottery-daily-update \
  --cron "0 9 * * *" \
  --path /api/scheduled/update \
  --description "Atualização diária de sorteios e verificação de sugestões"

# Cron job para atualização de análise
manus-heartbeat create \
  --name lottery-analysis-update \
  --cron "0 10 * * *" \
  --path /api/scheduled/analysis \
  --description "Atualização diária de análise de acertos"
```

## Gerenciamento de Cron Jobs

### Listar todos os cron jobs
```bash
manus-heartbeat list
```

### Ver logs de execução
```bash
manus-heartbeat logs --task-uid <uid>
```

### Ver logs com detalhes completos
```bash
manus-heartbeat logs --task-uid <uid> --with-body
```

### Pausar um cron job
```bash
manus-heartbeat update --task-uid <uid> --enable=false
```

### Retomar um cron job
```bash
manus-heartbeat update --task-uid <uid> --enable=true
```

### Remover um cron job
```bash
manus-heartbeat delete --task-uid <uid>
```

## Expressão Cron

Os cron jobs utilizam o formato de 6 campos (com segundos):

```
sec min hour dom mon dow
0   9   *    *   *   *
```

- **sec** (segundos): 0-59
- **min** (minutos): 0-59
- **hour** (horas): 0-23
- **dom** (dia do mês): 1-31
- **mon** (mês): 1-12
- **dow** (dia da semana): 0-6 (0 = domingo)

Exemplos:
- `0 9 * * *` - Diariamente às 09:00 UTC
- `0 0 * * 0` - Toda segunda-feira às 00:00 UTC
- `0 */6 * * *` - A cada 6 horas

## Fluxo de Funcionamento

```
1. Cron dispara às 09:00 UTC
   ↓
2. POST para /api/scheduled/update
   ↓
3. Handler verifica sugestões contra último sorteio
   ↓
4. Atualiza tabela suggestion_history com resultados
   ↓
5. Cron dispara às 10:00 UTC
   ↓
6. POST para /api/scheduled/analysis
   ↓
7. Handler recalcula estatísticas de precisão
   ↓
8. Atualiza tabela hit_analysis com dados agregados
```

## Troubleshooting

### Cron não está executando

1. Verifique se a aplicação está deployed:
   ```bash
   manus-heartbeat list
   ```

2. Verifique os logs de execução:
   ```bash
   manus-heartbeat logs --task-uid <uid> --with-body
   ```

3. Verifique se o endpoint está acessível:
   ```bash
   curl -X POST https://seu-dominio.manus.space/api/scheduled/update
   ```

### Erro de autenticação

- Certifique-se de que o cron está configurado corretamente
- Verifique se o `task_uid` está correto nos logs

### Dados não estão sendo atualizados

1. Verifique se existem sugestões na tabela `suggestion_history`
2. Verifique se existem sorteios recentes na tabela `euro_million_draws` ou `toto_draws`
3. Consulte os logs para erros específicos

## Monitoramento

Para monitorar a execução dos cron jobs:

```bash
# Ver últimas execuções
manus-heartbeat logs --task-uid <uid>

# Ver execuções com falha
manus-heartbeat logs --task-uid <uid> --status failed

# Ver execução específica
manus-heartbeat logs --task-uid <uid> --run-uid <run-id> --with-body
```

## Referência

Para mais informações sobre cron jobs, consulte:
- `references/periodic-updates.md` - Documentação completa do sistema de cron
- `server/scheduled.ts` - Implementação dos handlers
- `server/_core/heartbeat.ts` - SDK de cron jobs
