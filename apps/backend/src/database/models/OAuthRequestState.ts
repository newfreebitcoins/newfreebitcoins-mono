import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize
} from "sequelize";

export class OAuthRequestState extends Model<
  InferAttributes<OAuthRequestState>,
  InferCreationAttributes<OAuthRequestState>
> {
  declare id: CreationOptional<number>;
  declare state: string;
  declare codeVerifier: string;
  declare bitcoinAddress: string;
  declare sessionSecretHash: string | null;
  declare expiresAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initialize(sequelize: Sequelize): typeof OAuthRequestState {
    OAuthRequestState.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        state: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        codeVerifier: {
          type: DataTypes.STRING,
          allowNull: false
        },
        bitcoinAddress: {
          type: DataTypes.STRING,
          allowNull: false
        },
        sessionSecretHash: {
          type: DataTypes.STRING,
          allowNull: true
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
      },
      {
        sequelize,
        tableName: "oauth_request_states",
        indexes: [{ fields: ["state"] }, { fields: ["expiresAt"] }]
      }
    );

    return OAuthRequestState;
  }
}
