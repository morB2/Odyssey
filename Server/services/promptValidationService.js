/**
 * Input Validation Service for Gemini prompts
 * Validates and sanitizes user input before sending to AI
 */

const MAX_PROMPT_LENGTH = 2000;
const MIN_PROMPT_LENGTH = 1;

/**
 * Validates and sanitizes a prompt
 * @param {string} prompt - The user prompt to validate
 * @returns {Object} - Validation result with isValid, sanitized, and error fields
 */
export function validatePrompt(prompt) {
  // Check if prompt exists
  if (!prompt || typeof prompt !== "string") {
    return {
      isValid: false,
      sanitized: "",
      error: "Prompt must be a non-empty string",
    };
  }

  // Length validation
  if (prompt.length < MIN_PROMPT_LENGTH) {
    return {
      isValid: false,
      sanitized: "",
      error: `Prompt must be at least ${MIN_PROMPT_LENGTH} character long`,
    };
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return {
      isValid: false,
      sanitized: "",
      error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`,
    };
  }

  // Sanitize: trim and normalize whitespace
  let sanitized = prompt.trim();

  // Remove null bytes and other control characters (except newlines, tabs, carriage returns)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  // Normalize multiple whitespace to single space (preserve newlines)
  sanitized = sanitized.replace(/[ \t]+/g, " ");

  // Remove leading/trailing whitespace from each line
  sanitized = sanitized
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  // Check if sanitization resulted in empty string
  if (!sanitized || sanitized.length === 0) {
    return {
      isValid: false,
      sanitized: "",
      error: "Prompt contains only invalid characters",
    };
  }

  // Character encoding validation - check for valid UTF-8
  try {
    // Attempt to encode/decode to ensure valid encoding
    Buffer.from(sanitized, "utf8").toString("utf8");
  } catch (error) {
    return {
      isValid: false,
      sanitized: "",
      error: "Prompt contains invalid character encoding",
    };
  }

  // Check for suspicious content patterns (basic)
  const suspiciousPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      return {
        isValid: false,
        sanitized: "",
        error: "Prompt contains potentially malicious content",
      };
    }
  }

  return {
    isValid: true,
    sanitized: sanitized,
    error: null,
  };
}

/**
 * Validates that a prompt is not empty after sanitization
 * @param {string} prompt - The prompt to check
 * @returns {boolean} - True if prompt has content
 */
export function hasContent(prompt) {
  if (!prompt || typeof prompt !== "string") return false;
  const sanitized = prompt.trim();
  return sanitized.length >= MIN_PROMPT_LENGTH;
}

