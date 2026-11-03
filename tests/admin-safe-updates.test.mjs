import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const sql=await fs.readFile(new URL('../supabase/schema/mama_admin3.sql',import.meta.url),'utf8');
assert(!/delete\s+from\s+(?:public\.)?mama_admin_sessions\s*;/i.test(sql),'Session revocation must include an explicit WHERE clause for production safeupdate.');
assert.equal((sql.match(/delete from mama_admin_sessions where token_hash is not null;/g)||[]).length,2,'Both password change and logout-all must explicitly target session rows.');
console.log('PASS: password change and logout-all comply with production safe-update protection.');
