import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "..", "config.json");

const databaseSchema = z
  .object({
    dialect: z.literal("postgres").default("postgres"),
    host: z.string().min(1),
    port: z.number().int().positive().default(5432),
    name: z.string().min(1),
    username: z.string().min(1),
    password: z.string().optional().default(""),
    ssl: z.boolean().default(false),
    connectionString: z.string().min(1).optional(),
    autoSync: z.boolean().default(true),
    alter: z.boolean().default(true)
  })
  .superRefine((value, ctx) => {
    if (
      !value.connectionString &&
      (!value.host || !value.name || !value.username)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "database.host, database.name, and database.username are required for postgres"
      });
    }
  });

const faucetSchema = z.object({
  totalBtc: z.string().default("0"),
  requestAmountSats: z.number().int().positive().default(2500),
  minimumAccountAgeYears: z.number().nonnegative().default(2),
  requireVerified: z.boolean().default(true),
  requestRefreshTimeoutMs: z.number().int().positive().default(60 * 60 * 1000),
  multiplePerAccount: z.boolean().default(false),
  allowRepeatPerAccount: z.boolean().default(false)
});

const donationsSchema = z.object({
  challengeRotationMs: z.number().int().positive().default(10 * 60 * 1000),
  heartbeatPollMs: z.number().int().positive().default(60 * 1000),
  activeWindowMs: z.number().int().positive().default(10 * 60 * 1000),
  balanceRefreshMs: z.number().int().positive().default(60 * 1000),
  executionPollMs: z.number().int().positive().default(15 * 1000),
  reservationWindowMs: z.number().int().positive().default(60 * 1000),
  feeRateSatPerVbyte: z.number().positive().default(2),
  minAcceptedSatsVByte: z.number().positive().default(2),
  broadcastRecoveryMs: z.number().int().positive().default(10 * 60 * 1000),
  minimumGraffitiBtc: z.string().regex(/^\d+(?:\.\d{1,8})?$/).default("0.00100000"),
  minimumReputationNeeded: z.number().int().default(-25),
  minSatsForHeartbeat: z.number().int().nonnegative().default(1000)
});

const electrsServerSchema = z.object({
  baseUrl: z.string().url(),
  publicBaseUrl: z.string().url().optional()
});

const xOAuthSchema = z.object({
  apiKey: z.string().min(1).optional(),
  apiSecret: z.string().min(1).optional(),
  bearerToken: z.string().min(1).optional(),
  clientType: z.enum(["public", "confidential"]).default("confidential"),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  callbackUrl: z.string().url(),
  scopes: z.array(z.string().min(1)).min(1).default(["users.read", "tweet.read"])
});

const normalizedConfigSchema = z.object({
  port: z.number().int().positive(),
  host: z.string().url().optional(),
  network: z.enum(["mainnet", "regtest"]).default("mainnet"),
  database: databaseSchema.default({
    dialect: "postgres",
    host: "127.0.0.1",
    port: 5432,
    name: "newfreebitcoins",
    username: "postgres",
    password: "",
    ssl: false
  }),
  electrs: z.object({
    mainnet: electrsServerSchema,
    regtest: electrsServerSchema
  }),
  explorer: z.object({
    mainnet: z.object({
      txBaseUrl: z.string().url()
    }),
    regtest: z.object({
      txBaseUrl: z.string().url()
    })
  }),
  faucet: faucetSchema.default({
    totalBtc: "0",
    requestAmountSats: 2500,
    minimumAccountAgeYears: 2,
    requireVerified: true
  }),
  donations: donationsSchema.default({
    challengeRotationMs: 10 * 60 * 1000,
    heartbeatPollMs: 60 * 1000,
    activeWindowMs: 10 * 60 * 1000,
    balanceRefreshMs: 60 * 1000,
    executionPollMs: 15 * 1000,
    reservationWindowMs: 60 * 1000,
    feeRateSatPerVbyte: 2,
    minAcceptedSatsVByte: 2,
    broadcastRecoveryMs: 10 * 60 * 1000,
    minimumGraffitiBtc: "0.00100000",
    minimumReputationNeeded: -25,
    minSatsForHeartbeat: 1000
  }),
  xOAuth: xOAuthSchema
});

const legacyConfigSchema = z.object({
  port: z.number().int().positive(),
  host: z.string().url().optional(),
  network: z.enum(["mainnet", "regtest"]).optional(),
  x_client_id: z.string().min(1),
  x_client_secret: z.string().min(1),
  x_api_key: z.string().min(1).optional(),
  x_api_secret: z.string().min(1).optional(),
  x_bearer_token: z.string().min(1).optional(),
  x_client_type: z.enum(["public", "confidential"]).optional(),
  x_callback_url: z.string().url().optional(),
  x_scopes: z.array(z.string().min(1)).optional(),
  faucet_total_btc: z.string().optional(),
  faucet_request_amount_sats: z.number().int().positive().optional(),
  faucet_minimum_account_age_years: z.number().nonnegative().optional(),
  faucet_require_verified: z.boolean().optional(),
  faucet_request_refresh_timeout_ms: z.number().int().positive().optional(),
  faucet_multiple_per_account: z.boolean().optional(),
  faucet_allow_repeat_per_account: z.boolean().optional(),
  donations_challenge_rotation_ms: z.number().int().positive().optional(),
  donations_heartbeat_poll_ms: z.number().int().positive().optional(),
  donations_active_window_ms: z.number().int().positive().optional(),
  donations_balance_refresh_ms: z.number().int().positive().optional(),
  donations_execution_poll_ms: z.number().int().positive().optional(),
  donations_reservation_window_ms: z.number().int().positive().optional(),
  donations_fee_rate_sat_per_vbyte: z.number().positive().optional(),
  donations_min_accepted_sats_vbyte: z.number().positive().optional(),
  donations_broadcast_recovery_ms: z.number().int().positive().optional(),
  donations_minimum_graffiti_btc: z.string().regex(/^\d+(?:\.\d{1,8})?$/).optional(),
  donations_minimum_reputation_needed: z.number().int().optional(),
  donations_min_sats_for_heartbeat: z.number().int().nonnegative().optional(),
  electrum_mainnet_host: z.string().optional(),
  electrum_mainnet_port: z.number().int().positive().optional(),
  electrum_mainnet_protocol: z.enum(["tcp", "tls"]).optional(),
  electrum_regtest_host: z.string().optional(),
  electrum_regtest_port: z.number().int().positive().optional(),
  electrum_regtest_protocol: z.enum(["tcp", "tls"]).optional(),
  electrs_mainnet_base_url: z.string().url().optional(),
  electrs_mainnet_public_base_url: z.string().url().optional(),
  electrs_regtest_base_url: z.string().url().optional(),
  electrs_regtest_public_base_url: z.string().url().optional(),
  explorer_mainnet_tx_base_url: z.string().url().optional(),
  explorer_regtest_tx_base_url: z.string().url().optional(),
    database_dialect: z.literal("postgres").optional(),
    database_host: z.string().optional(),
    database_port: z.number().int().positive().optional(),
    database_name: z.string().optional(),
    database_username: z.string().optional(),
    database_password: z.string().optional(),
    database_ssl: z.boolean().optional(),
    database_connection_string: z.string().optional(),
    database_auto_sync: z.boolean().optional(),
    database_alter: z.boolean().optional()
  });

export type AppConfig = z.infer<typeof normalizedConfigSchema>;

function normalizeConfig(parsed: unknown): AppConfig {
  const normalizedAttempt = normalizedConfigSchema.safeParse(parsed);

  if (normalizedAttempt.success) {
    return normalizedAttempt.data;
  }

  const legacy = legacyConfigSchema.parse(parsed);

  return normalizedConfigSchema.parse({
    port: legacy.port,
    host: legacy.host,
    network: legacy.network ?? "mainnet",
    database: {
      dialect: "postgres",
      host: legacy.database_host ?? "127.0.0.1",
      port: legacy.database_port ?? 5432,
      name: legacy.database_name ?? "newfreebitcoins",
      username: legacy.database_username ?? "postgres",
      password: legacy.database_password ?? "",
      ssl: legacy.database_ssl ?? false,
      connectionString: legacy.database_connection_string,
      autoSync: legacy.database_auto_sync ?? true,
      alter: legacy.database_alter ?? true
    },
    electrs: {
      mainnet: {
        baseUrl: legacy.electrs_mainnet_base_url ?? "http://127.0.0.1:4332",
        publicBaseUrl:
          legacy.electrs_mainnet_public_base_url ??
          "https://electrs.newfreebitcoins.com/mainnet"
      },
      regtest: {
        baseUrl: legacy.electrs_regtest_base_url ?? "http://127.0.0.1:4335",
        publicBaseUrl:
          legacy.electrs_regtest_public_base_url ??
          "https://electrs.newfreebitcoins.com/regtest"
      }
    },
    explorer: {
      mainnet: {
        txBaseUrl:
          legacy.explorer_mainnet_tx_base_url ??
          "https://mempool.space/tx/"
      },
      regtest: {
        txBaseUrl:
          legacy.explorer_regtest_tx_base_url ??
          "http://127.0.0.1:3002/tx/"
      }
    },
    faucet: {
      totalBtc: legacy.faucet_total_btc ?? "0",
      requestAmountSats: legacy.faucet_request_amount_sats ?? 2500,
      minimumAccountAgeYears: legacy.faucet_minimum_account_age_years ?? 2,
      requireVerified: legacy.faucet_require_verified ?? true,
      requestRefreshTimeoutMs:
        legacy.faucet_request_refresh_timeout_ms ?? 60 * 60 * 1000,
      multiplePerAccount: legacy.faucet_multiple_per_account ?? false,
      allowRepeatPerAccount:
        legacy.faucet_allow_repeat_per_account ?? false
    },
    donations: {
      challengeRotationMs: legacy.donations_challenge_rotation_ms ?? 10 * 60 * 1000,
      heartbeatPollMs: legacy.donations_heartbeat_poll_ms ?? 60 * 1000,
      activeWindowMs: legacy.donations_active_window_ms ?? 10 * 60 * 1000,
      balanceRefreshMs: legacy.donations_balance_refresh_ms ?? 60 * 1000,
      executionPollMs: legacy.donations_execution_poll_ms ?? 15 * 1000,
      reservationWindowMs: legacy.donations_reservation_window_ms ?? 60 * 1000,
      feeRateSatPerVbyte: legacy.donations_fee_rate_sat_per_vbyte ?? 2,
      minAcceptedSatsVByte: legacy.donations_min_accepted_sats_vbyte ?? 2,
      broadcastRecoveryMs:
        legacy.donations_broadcast_recovery_ms ?? 10 * 60 * 1000,
      minimumGraffitiBtc:
        legacy.donations_minimum_graffiti_btc ?? "0.00100000",
      minimumReputationNeeded:
        legacy.donations_minimum_reputation_needed ?? -25,
      minSatsForHeartbeat:
        legacy.donations_min_sats_for_heartbeat ?? 1000
    },
    xOAuth: {
      apiKey: legacy.x_api_key,
      apiSecret: legacy.x_api_secret,
      bearerToken: legacy.x_bearer_token,
      clientType: legacy.x_client_type ?? "confidential",
      clientId: legacy.x_client_id,
      clientSecret: legacy.x_client_secret,
      callbackUrl:
        legacy.x_callback_url ??
          "https://newfreebitcoins.com/api/x_oauth2_callback",
      scopes: legacy.x_scopes ?? ["users.read", "tweet.read"]
    }
  });
}

export function loadConfig(): AppConfig {
  const raw = readFileSync(configPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  return normalizeConfig(parsed);
}
