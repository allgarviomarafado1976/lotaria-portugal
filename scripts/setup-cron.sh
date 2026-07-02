#!/bin/bash

# Script para configurar cron jobs para atualização automática de sorteios
# Este script deve ser executado após fazer deploy da aplicação

set -e

echo "🔄 Configurando cron jobs para Lotaria Portugal..."

# Cron job para atualizar sorteios diariamente às 9:00 AM UTC
echo "📅 Criando cron job para atualização diária de sorteios (09:00 UTC)..."
manus-heartbeat create \
  --name lottery-daily-update \
  --cron "0 9 * * *" \
  --path /api/scheduled/update \
  --description "Atualização diária de sorteios e verificação de sugestões"

# Cron job para atualizar análise de acertos diariamente às 10:00 AM UTC
echo "📊 Criando cron job para atualização de análise (10:00 UTC)..."
manus-heartbeat create \
  --name lottery-analysis-update \
  --cron "0 10 * * *" \
  --path /api/scheduled/analysis \
  --description "Atualização diária de análise de acertos"

echo "✅ Cron jobs configurados com sucesso!"
echo ""
echo "📋 Crons criados:"
manus-heartbeat list

echo ""
echo "💡 Para gerenciar os crons, use:"
echo "  manus-heartbeat list              # Listar todos os crons"
echo "  manus-heartbeat logs --task-uid <uid>  # Ver logs de execução"
echo "  manus-heartbeat update --task-uid <uid> --enable=false  # Pausar"
echo "  manus-heartbeat update --task-uid <uid> --enable=true   # Retomar"
echo "  manus-heartbeat delete --task-uid <uid>  # Remover"
