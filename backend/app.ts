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

dotenv.config();

const app = express();

// Initialize database connection
initializeDatabase();

// CORS configuration
const allowedOrigins = ["http://localhost:3000"];

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

// Custom cookie middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const cookiesHeader = req.headers.cookie || "";
  req.cookies = cookie.parse(cookiesHeader); // attaches cookies to req.cookies
  next();
});

// Swagger docs
import swaggerDocument from "./docs/swagger.json";
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Register TSOA-generated routes
RegisterRoutes(app);

const [notFoundHandler, errorLogger, errorResponder] = errorHandlerMiddleware();
app.use(notFoundHandler);
app.use(errorLogger);

// Handle non-API routes
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {

  if (req.path.startsWith('/api')) { return errorResponder(error, req, res, next) }
  else { next(); }

});



export default app;
