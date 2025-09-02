import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema";

if (!process.env.DATABASE_URL) {
	throw new Error(
		"DATABASE_URL is not set. Please add your Supabase connection pooler URL to .env.local",
	);
}

if (process.env.DATABASE_URL.includes("[YOUR-PASSWORD]")) {
	throw new Error(
		"DATABASE_URL contains placeholder password. Please replace [YOUR-PASSWORD] with your actual Supabase password",
	);
}

const client = postgres(process.env.DATABASE_URL!);
export const supabaseDbClient = drizzle(client, { schema });
