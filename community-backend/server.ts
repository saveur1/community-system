import express, { type Request, type Response, type NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./generated/routes";
import errorHandlerMiddleware from "./middlewares/errorHandler";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/database";
// Ensure all models are loaded and associations are registered
import "./models/index";
import cookie from "cookie";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Initialize database connection
initializeDatabase();


// CORS configuration
const allowedOrigins = ["http://localhost:3000", "https://sugiramwana.rw","https://api.sugiramwana.rw" ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());
app.use(morgan('combined'));
app.use(cookieParser())




// Register TSOA-generated routes
RegisterRoutes(app);

// Swagger docs
import swaggerDocument from "./docs/swagger.json";
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const [notFoundHandler, errorLogger, errorResponder] = errorHandlerMiddleware();
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorResponder);

// import express from 'express';
// const app = express();
// import dotenv from "dotenv";
// import config from "./config/config";
// import { Sequelize } from 'sequelize';
// // import { Sequelize } from 'sequelize';
// dotenv.config()

// Sample users list
// const users = [
//   { id: 1, name: 'Alice', email: 'alice@example.com' },
//   { id: 2, name: 'Bob', email: 'bob@example.com' },
//   { id: 3, name: 'Charlie', email: 'charlie@example.com' },
// ];

// Root route → prints users list
// app.get('/', (req, res) => {

//   const sequelizeOptions: any = {
//     host: config.database.host,
//     port: config.database.port,
//     dialect: config.database.dialect,
//     logging: config.database.logging,
//   };
  
//   const sequelize = new Sequelize(config.database.databaseName, config.database.user, config.database.password, sequelizeOptions);
//   res.json(sequelizeOptions); // Respond with JSON
// });



export default app;
