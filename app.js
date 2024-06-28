const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");
const { initializePusher } = require("./socketServer"); // Import the Pusher initializer
const apiRouter = require("./routes/api");
const authApiRouter = require("./routes/auth");
const errorHandlers = require("./handlers/errorHandlers");
const { isValidToken } = require("./controllers/authController");
require("dotenv").config({ path: ".env" });
const cors = require("cors");
const promisify = require("es6-promisify");

// Create our Express app
const app = express();
const server = http.createServer(app);
app.use(cors()); // Enable CORS for all routes

// Initialize Pusher and get the io instance
const pusher = initializePusher(); // Initialize Pusher

// Middleware setup
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sessions configuration
app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE }),
  })
);

// Middleware to pass variables to templates and requests
app.use((req, res, next) => {
  res.locals.admin = req.admin || null;
  res.locals.currentPath = req.path;
  next();
});

// Promisify some callback-based APIs
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,PATCH,PUT,POST,DELETE");
  res.header("Access-Control-Expose-Headers", "Content-Length");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization,x-auth-token, Content-Type, X-Requested-With, Range"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  } else {
    return next();
  }
});

// API routes
app.use("/api", authApiRouter);
app.use("/api", isValidToken, apiRouter);

// Handle 404 errors
app.use(errorHandlers.notFound);

// Development error handler
if (app.get("env") === "development") {
  app.use(errorHandlers.developmentErrors);
}

// Production error handler
app.use(errorHandlers.productionErrors);

// Start the server

module.exports = app;
