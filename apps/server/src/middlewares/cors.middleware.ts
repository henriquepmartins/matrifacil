import cors from "cors";
import { env } from "../config/env.config.js";

// Parse CORS_ORIGIN to support multiple domains
const corsOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

// Add Vercel domains to allowed origins
const vercelDomains = [
  "https://web-27ikuvveh-henriquepmartins-projects.vercel.app",
  "https://matrifacil-web.vercel.app",
  "https://*.vercel.app",
];

const allAllowedOrigins = [...corsOrigins, ...vercelDomains];

export const corsMiddleware = cors({
  origin: true, // Temporarily allow all origins for testing
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
});
