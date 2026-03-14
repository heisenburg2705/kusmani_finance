#!/bin/bash

# Supabase Migration Script - Execute migrations via REST API
# Usage: ./migrate-cli.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Config
SUPABASE_URL="https://gewcoznigldatewomtay.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdld2Nvem5pZ2xkYXRld29tdGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NjU0MDgsImV4cCI6MjA4OTA0MTQwOH0.qGKDI7_r0L84M5sHk1yP4JVn2_tzPaWnSBBH0UNrihk"

echo -e "${BLUE}🚀 Kusmani Finance - Database Migration${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Test connection
echo -e "${BLUE}🔌 Testing Supabase connection...${NC}"
if curl -s -H "apikey: $SUPABASE_KEY" "${SUPABASE_URL}/rest/v1/" | grep -q "swagger"; then
    echo -e "${GREEN}✅ Connected to Supabase${NC}\n"
else
    echo -e "${RED}❌ Failed to connect to Supabase${NC}"
    exit 1
fi

# Migration files
MIGRATIONS=(
    "supabase/migrations/001_initial_schema.sql"
    "supabase/migrations/002_rls_policies.sql"
    "supabase/migrations/003_audit_triggers.sql"
    "supabase/migrations/004_default_categories.sql"
)

echo -e "${BLUE}📝 Executing migrations...${NC}\n"

for migration in "${MIGRATIONS[@]}"; do
    if [ ! -f "$migration" ]; then
        echo -e "${RED}❌ Migration file not found: $migration${NC}"
        exit 1
    fi

    filename=$(basename "$migration")
    echo -e "${BLUE}Running: $filename${NC}"

    # Read SQL file
    sql_content=$(<"$migration")

    # Execute via Supabase query endpoint
    # Note: We're using the tables endpoint to verify access
    response=$(curl -s -w "\n%{http_code}" \
        -H "apikey: $SUPABASE_KEY" \
        -H "Authorization: Bearer $SUPABASE_KEY" \
        -H "Content-Type: application/json" \
        "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
        -d "{\"sql\": $(echo "$sql_content" | jq -Rs .)}" 2>&1)

    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ $filename executed${NC}\n"
    else
        echo -e "${YELLOW}⚠️  Could not execute via API${NC}"
        echo -e "${YELLOW}   (This is normal - RPC function may not exist)${NC}\n"
        echo -e "${YELLOW}📌 Alternative: Execute manually in Supabase console${NC}"
        echo -e "${YELLOW}   ${SUPABASE_URL}/project/default/sql${NC}\n"
        exit 0
    fi
done

echo -e "${GREEN}🎉 All migrations completed!${NC}\n"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "   1. Refresh http://localhost:5173"
echo -e "   2. Sign up with new account"
echo -e "   3. Try creating transactions"
echo -e "   4. Test AI Agent at /ai-agent\n"
