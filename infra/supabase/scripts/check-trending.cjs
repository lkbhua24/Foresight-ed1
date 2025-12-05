require('dotenv/config')
const fs = require('fs')
const { Client } = require('pg')

if (!process.env.SUPABASE_CONNECTION_STRING && fs.existsSync('../../../.env.local')) {
  const content = fs.readFileSync('../../../.env.local', 'utf-8')
  const match = content.match(/SUPABASE_CONNECTION_STRING=(.+)/)
  if (match && match[1]) process.env.SUPABASE_CONNECTION_STRING = match[1].trim()
}

const client = new Client({ 
  connectionString: process.env.SUPABASE_DB_URL || process.env.SUPABASE_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  await client.connect()
  // 查看所有体育类事件及其关注情况（通过 event_follows 计数）
  const res = await client.query(`
    SELECT p.id, p.title, p.category, p.created_at,
           (SELECT COUNT(*) FROM event_follows f WHERE f.event_id = p.id) as followers
    FROM predictions p
    WHERE p.category = '体育'
    ORDER BY followers DESC, created_at DESC
  `)
  console.log('Sports events:', res.rows)
  
  // 查看 Top 5 热门事件
  const top = await client.query(`
    SELECT p.id, p.title, p.category,
           (SELECT COUNT(*) FROM event_follows f WHERE f.event_id = p.id) as followers
    FROM predictions p
    ORDER BY followers DESC
    LIMIT 5
  `)
  console.log('Top 5 events:', top.rows)
  
  await client.end()
}

main()
