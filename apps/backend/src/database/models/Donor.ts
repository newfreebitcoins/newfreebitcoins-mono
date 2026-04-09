import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize
} from "sequelize";

export class Donor extends Model<
  InferAttributes<Donor>,
  InferCreationAttributes<Donor>
> {
  declare id: CreationOptional<number>;
  declare network: "mainnet" | "regtest";
  declare address: string;
  declare reputation: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initialize(sequelize: Sequelize): typeof Donor {
    Donor.init(
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
        address: {
          type: DataTypes.STRING,
          allowNull: false
        },
        reputation: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
      },
      {
        sequelize,
        tableName: "donors",
        indexes: [
          {
            unique: true,
            fields: ["network", "address"]
          },
          { fields: ["network"] },
          { fields: ["address"] },
          { fields: ["reputation"] }
        ]
      }
    );

    return Donor;
  }
}
