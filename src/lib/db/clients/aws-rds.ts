import { drizzle } from "drizzle-orm/aws-data-api/pg";
import { RDSDataClient } from "@aws-sdk/client-rds-data";
import * as schema from "../schema";

if (!process.env.AURORA_DB_NAME) {
	throw new Error(
		"AURORA_DB_NAME is not set. Please add your AWS RDS connection database name to .env.local",
	);
}

if (!process.env.AURORA_SECRET_ARN) {
	throw new Error(
		"AURORA_SECRET_ARN is not set. Please add your AWS RDS secret arn to .env.local",
	);
}

if (!process.env.AURORA_RESOURCE_ARN) {
	throw new Error(
		"AURORA_RESOURCE_ARN is not set. Please add your AWS RDS resource arn to .env.local",
	);
}

const rdsClient = new RDSDataClient({
	region: process.env.NEXT_PUBLIC_AURORA_REGION,
});

export const rdsDbClient = drizzle(rdsClient, {
	database: process.env.AURORA_DB_NAME,
	secretArn: process.env.AURORA_SECRET_ARN,
	resourceArn: process.env.AURORA_RESOURCE_ARN,
	schema,
});
