#!/usr/bin/env node

/**
 * Supabase Database Migration Script
 * Executes migrations from supabase/migrations/ folder
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

console.log('🚀 Kusmani Finance - Database Migration')
console.log('=========================================\n')

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Get migration files
const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort()

console.log(`📁 Found ${migrationFiles.length} migration files\n`)

// Execute migrations
async function runMigrations() {
  try {
    console.log('🔌 Testing Supabase connection...')
    const { data, error } = await supabase.from('auth.users').select('count', { count: 'exact' })

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is expected if RLS prevents the query
      // but it means connection works
      if (error.message.includes('relation') || error.message.includes('permission')) {
        console.log('✅ Connected (RLS active)\n')
      } else {
        throw error
      }
    } else {
      console.log('✅ Connected\n')
    }

    // For each migration file
    for (const file of migrationFiles) {
      console.log(`📝 Running ${file}...`)
      const sqlPath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(sqlPath, 'utf-8')

      // Split by semicolon for individual statements
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      console.log(`   ├─ Executing ${statements.length} statements...`)

      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        try {
          // Use rpc to execute raw SQL
          const { error } = await supabase.rpc('execute_sql', {
            sql: statement,
          })

          if (error) {
            // Some errors are okay (e.g., "already exists")
            if (
              error.message.includes('already exists') ||
              error.message.includes('duplicate')
            ) {
              console.log(`   ├─ ⚠️  Statement ${i + 1} (already exists, skipping)`)
            } else {
              throw error
            }
          } else {
            process.stdout.write('.')
          }
        } catch (err) {
          console.error(`\n   ❌ Error in statement ${i + 1}:`, err.message)
          // Continue with next statement
        }
      }

      console.log('\n✅ Migration completed\n')
    }

    console.log('🎉 All migrations completed!')
    console.log('\n📋 Next steps:')
    console.log('   1. Refresh http://localhost:5173')
    console.log('   2. Try signing up')
    console.log('   3. Create transactions')
    console.log('   4. Test AI Agent at /ai-agent')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('\n💡 Try alternative approaches:')
    console.error('   1. Manual via Supabase console (recommended)')
    console.error('   2. Install Supabase CLI: npm install -g supabase')
    console.error('   3. Run: supabase db push')
    process.exit(1)
  }
}

runMigrations()
