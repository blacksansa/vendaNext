#!/bin/bash

echo "🔧 Aplicando correções de autenticação..."

# 1. Remover console.logs em loop
echo "📝 Removendo console.logs problemáticos..."
sed -i '/console.log.*Current roles/d' src/app/*/page.tsx
sed -i '/console.log.*\[analytics\] Roles/d' src/app/analytics/page.tsx
sed -i '/console.log.*\[lideres\] Roles/d' src/app/lideres/page.tsx

echo "✅ Correções aplicadas!"
