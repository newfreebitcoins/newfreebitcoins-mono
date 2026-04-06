import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize
} from "sequelize";

export type FaucetRequestStatus =
  | "pending"
  | "broadcast"
  | "expired"
  | "rejected"
  | "paid";

export class FaucetRequest extends Model<
  InferAttributes<FaucetRequest>,
  InferCreationAttributes<FaucetRequest>
> {
  declare id: CreationOptional<number>;
  declare network: "mainnet" | "regtest";
  declare xUserId: string;
  declare xUsername: string;
  declare xName: string | null;
  declare xCreatedAt: Date;
  declare xVerified: boolean;
  declare bitcoinAddress: string;
  declare amountSats: number;
  declare status: FaucetRequestStatus;
  declare expiresAt: Date;
  declare refreshSecretHash: string | null;
  declare reservedByAddress: string | null;
  declare reservationExpiresAt: Date | null;
  declare fulfillmentTxId: string | null;
  declare paidByAddress: string | null;
  declare paidAt: Date | null;
  declare rejectionReason: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initialize(sequelize: Sequelize): typeof FaucetRequest {
    FaucetRequest.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        network: {
          type: DataTypes.STRING,
          allowNull: false
        },
        xUserId: {
          type: DataTypes.STRING,
          allowNull: false
        },
        xUsername: {
          type: DataTypes.STRING,
          allowNull: false
        },
        xName: {
          type: DataTypes.STRING,
          allowNull: true
        },
        xCreatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        xVerified: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        bitcoinAddress: {
          type: DataTypes.STRING,
          allowNull: false
        },
        amountSats: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 2500
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "pending"
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: true
        },
        refreshSecretHash: {
          type: DataTypes.STRING,
          allowNull: true
        },
        reservedByAddress: {
          type: DataTypes.STRING,
          allowNull: true
        },
        reservationExpiresAt: {
          type: DataTypes.DATE,
          allowNull: true
        },
        fulfillmentTxId: {
          type: DataTypes.STRING,
          allowNull: true
        },
        paidByAddress: {
          type: DataTypes.STRING,
          allowNull: true
        },
        paidAt: {
          type: DataTypes.DATE,
          allowNull: true
        },
        rejectionReason: {
          type: DataTypes.STRING,
          allowNull: true
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
      },
      {
        sequelize,
        tableName: "faucet_requests",
        indexes: [
          { fields: ["network"] },
          { fields: ["network", "status"] },
          { fields: ["network", "xUserId"] },
          { fields: ["status"] },
          { fields: ["xUserId"] },
          { fields: ["createdAt"] },
          { fields: ["expiresAt"] },
          { fields: ["reservedByAddress"] },
          { fields: ["reservationExpiresAt"] },
          { fields: ["fulfillmentTxId"] }
        ]
      }
    );

    return FaucetRequest;
  }
}
