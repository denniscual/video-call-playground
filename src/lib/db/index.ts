import { rdsDbClient } from "./clients/aws-rds";
// import { supabaseDbClient } from "./clients/supabase";

export const db = rdsDbClient;
