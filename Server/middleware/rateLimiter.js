import rateLimit from "express-rate-limit";

/**
 * Rate limiter for AI trip suggestions endpoint
 * Limits to 10 requests per 15 minutes per IP
 */
export const suggestionsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    error: "Too many requests. Please try again in 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Rate limiter for route optimization endpoint
 * Limits to 5 requests per 15 minutes per IP
 */
export const routeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window (more expensive operation)
  message: {
    success: false,
    error: "Too many route optimization requests. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for trip customization endpoint
 * Limits to 8 requests per 15 minutes per IP
 */
export const customizeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // 8 requests per window
  message: {
    success: false,
    error: "Too many customization requests. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General rate limiter for trip-related endpoints
 * Limits to 15 requests per 15 minutes per IP
 */
export const generalTripRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 requests per window
  message: {
    success: false,
    error: "Too many requests. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

