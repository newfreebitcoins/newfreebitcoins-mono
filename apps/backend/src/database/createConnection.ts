import { Sequelize } from "sequelize";
import { loadConfig } from "../config.js";
import {
  Donor,
  FaucetRequest,
  OAuthRequestState
} from "./models/types.js";

export const models = {} as Models;

export interface Models {
  Donor: typeof Donor;
  FaucetRequest: typeof FaucetRequest;
  OAuthRequestState: typeof OAuthRequestState;
  sequelize: Sequelize;
}

function createSequelize(): Sequelize {
  const config = loadConfig();
  const databaseConfig = config.database;

  if (databaseConfig.connectionString) {
    return new Sequelize(databaseConfig.connectionString, {
      dialect: "postgres",
      logging: false
    });
  }

  return new Sequelize({
    dialect: "postgres",
    host: databaseConfig.host,
    port: databaseConfig.port,
    database: databaseConfig.name,
    username: databaseConfig.username,
    password: databaseConfig.password,
    dialectOptions: databaseConfig.ssl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      : undefined,
    logging: false
  });
}

export async function databaseConnection(): Promise<Models> {
  const config = loadConfig();
  const sequelize = createSequelize();

  models.Donor = Donor.initialize(sequelize);
  models.FaucetRequest = FaucetRequest.initialize(sequelize);
  models.OAuthRequestState = OAuthRequestState.initialize(sequelize);
  models.sequelize = sequelize;

  await sequelize.authenticate();

  if (config.database.autoSync) {
    await sequelize.sync({
      alter: config.database.alter
    });
  }

  return models;
}
