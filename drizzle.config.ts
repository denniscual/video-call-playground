import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./.env.local" });

if (
	!process.env.AURORA_DB_NAME ||
	!process.env.AURORA_SECRET_ARN ||
	!process.env.AURORA_RESOURCE_ARN
) {
	throw new Error(
		"AURORA_DB_NAME, AURORA_SECRET_ARN, and AURORA_RESOURCE_ARN must be set in your env file.",
	);
}

export default defineConfig({
	schema: "./src/lib/db/schema.ts", // path to your schema file(s)
	out: "./drizzle", // where to output migration files
	dialect: "postgresql",
	driver: "aws-data-api",
	dbCredentials: {
		database: process.env.AURORA_DB_NAME,
		secretArn: process.env.AURORA_SECRET_ARN,
		resourceArn: process.env.AURORA_RESOURCE_ARN,
	},
});
