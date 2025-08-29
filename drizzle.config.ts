import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL must be set");
}

let connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
  connectionString = `postgresql://postgres:[PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`;
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString!,
  },
});