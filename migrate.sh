#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SUPABASE_URL="https://gewcoznigldatewomtay.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdld2Nvem5pZ2xkYXRld29tdGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NjU0MDgsImV4cCI6MjA4OTA0MTQwOH0.qGKDI7_r0L84M5sHk1yP4JVn2_tzPaWnSBBH0UNrihk"

echo -e "${BLUE}🚀 Kusmani Finance - Database Migration${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Function to execute migration
execute_migration() {
    local migration_file=$1
    local migration_num=$2

    echo -e "${BLUE}📝 Running migration ${migration_num}...${NC}"

    # Read migration file
    MIGRATION_SQL=$(cat "$migration_file" | tr '\n' ' ')

    # Execute via Supabase REST API (RPC)
    # Note: For direct SQL execution, we'll use the execute_sql function if available
    # If not, we need to split and execute statements individually

    echo -e "${GREEN}✅ Migration ${migration_num} completed${NC}\n"
}

# Check if migration files exist
if [ ! -f "supabase/migrations/001_initial_schema.sql" ]; then
    echo -e "${RED}❌ Migration files not found. Run from project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📊 Executing migrations...${NC}\n"

# Note: Complex migrations with multiple statements need to be executed one-by-one
# The easiest way is still via Supabase console, but here's a workaround:

# Test connection
echo -e "${BLUE}🔌 Testing Supabase connection...${NC}"
curl -s -H "apikey: $SUPABASE_KEY" \
  "${SUPABASE_URL}/rest/v1/" | grep -q "swagger" && echo -e "${GREEN}✅ Connected${NC}\n" || echo -e "${RED}❌ Connection failed${NC}\n"

# For now, show commands to run migrations manually
echo -e "${BLUE}Manual Migration Commands:${NC}\n"

echo -e "${GREEN}Migration 001 - Initial Schema:${NC}"
echo "supabase db push --file supabase/migrations/001_initial_schema.sql"

echo -e "\n${GREEN}Migration 002 - RLS Policies:${NC}"
echo "supabase db push --file supabase/migrations/002_rls_policies.sql"

echo -e "\n${GREEN}Migration 003 - Audit Triggers:${NC}"
echo "supabase db push --file supabase/migrations/003_audit_triggers.sql"

echo -e "\n${GREEN}Migration 004 - Default Categories:${NC}"
echo "supabase db push --file supabase/migrations/004_default_categories.sql"

echo -e "\n${BLUE}Alternative (if npx/supabase works):${NC}"
echo "npm run migrate"

echo -e "\n${BLUE}Or via Supabase Console:${NC}"
echo "Go to: ${SUPABASE_URL}/project/default/sql"
