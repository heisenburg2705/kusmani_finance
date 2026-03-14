#!/bin/bash

# Supabase Project URL and Key
SUPABASE_URL="https://gewcoznigldatewomtay.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdld2Nvem5pZ2xkYXRld29tdGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NjU0MDgsImV4cCI6MjA4OTA0MTQwOH0.qGKDI7_r0L84M5sHk1yP4JVn2_tzPaWnSBBH0UNrihk"

echo "🚀 Running database migrations..."

# Migration 1: Initial Schema
echo "📝 Running migration 001_initial_schema.sql..."
MIGRATION_001=$(cat supabase/migrations/001_initial_schema.sql)

curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": $(echo "$MIGRATION_001" | jq -Rs .)}" \
  2>/dev/null && echo "✅ Migration 001 completed" || echo "❌ Migration 001 failed"

# Note: For complex migrations with multiple statements,
# it's better to run them individually via Supabase console
echo ""
echo "⚠️  For remaining migrations, please execute manually in Supabase console:"
echo "   1. Go to https://gewcoznigldatewomtay.supabase.co/project/default/sql"
echo "   2. Create new query"
echo "   3. Copy-paste content from:"
echo "      - supabase/migrations/002_rls_policies.sql"
echo "      - supabase/migrations/003_audit_triggers.sql"
echo "      - supabase/migrations/004_default_categories.sql"
echo "   4. Run each one"
echo ""
echo "✅ Setup complete!"
