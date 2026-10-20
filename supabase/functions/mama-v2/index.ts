import {makeHandler,type Environment} from "./backend.ts";
const names=["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","APP_SECRET","ADMIN_PASSWORD","ALLOWED_ORIGINS"] as const;
const env=Object.fromEntries(names.map(name=>[name,Deno.env.get(name)||""])) as Environment;
Deno.serve(makeHandler(env));
