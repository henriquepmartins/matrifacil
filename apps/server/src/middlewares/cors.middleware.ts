import cors from "cors";
import { env } from "../config/env.config.js";

// Parse CORS_ORIGIN to support multiple domains
const corsOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

// Add Vercel domains to allowed origins
const vercelDomains = [
  "https://web-27ikuvveh-henriquepmartins-projects.vercel.app",
  "https://matrifacil-web.vercel.app",
  "https://*.vercel.app"
];

const allAllowedOrigins = [...corsOrigins, ...vercelDomains];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    console.log(`CORS check - Origin: ${origin}`);
    console.log(`CORS check - Allowed origins:`, allAllowedOrigins);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in the allowed list
    if (allAllowedOrigins.includes(origin)) {
      console.log(`CORS allowed origin: ${origin}`);
      callback(null, true);
    } else {
      // Check if origin matches Vercel pattern
      const isVercelDomain = vercelDomains.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(origin);
        }
        return pattern === origin;
      });
      
      if (isVercelDomain) {
        console.log(`CORS allowed Vercel origin: ${origin}`);
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
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
