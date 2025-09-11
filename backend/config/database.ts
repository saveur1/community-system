import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import config from "./config";
dotenv.config();


const sequelizeOptions: any = {
  host: config.database.host,
  port: config.database.port,
  dialect: config.database.dialect,
  logging: config.database.logging,
};

// if(!config.isDev){
//     sequelizeOptions.dialectOptions = {
//         ssl: {
//             rejectUnauthorized: true,
//         },
//     };
// }

const sequelize = new Sequelize(config.database.databaseName, config.database.user, config.database.password, sequelizeOptions);

export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({ alter: true });
    console.info("Connection to the database has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

export default sequelize;
