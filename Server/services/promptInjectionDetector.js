/**
 * Prompt Injection Detection Service
 * Detects attempts to override system instructions or jailbreak the AI
 */

import { validatePrompt } from "./promptValidationService.js";

// Common prompt injection patterns
const INJECTION_PATTERNS = [
  // Direct instruction override attempts
  /ignore\s+(previous|all|your|the)\s+(instructions?|prompts?|rules?|system)/gi,
  /forget\s+(previous|all|your|the)\s+(instructions?|prompts?|rules?|system)/gi,
  /disregard\s+(previous|all|your|the)\s+(instructions?|prompts?|rules?|system)/gi,
  /you\s+are\s+now/gi,
  /from\s+now\s+on/gi,
  /new\s+(instructions?|prompts?|rules?)/gi,
  /override\s+(previous|all|your|the)\s+(instructions?|prompts?|rules?)/gi,
  
  // Role-playing attempts
  /you\s+are\s+(a|an|the)\s+\w+/gi,
  /pretend\s+(you|to|that)/gi,
  /act\s+as\s+(if|though)/gi,
  /simulate\s+(being|that)/gi,
  
  // Jailbreak techniques
  /DAN\s+(mode|activate|enabled)/gi,
  /developer\s+mode/gi,
  /jailbreak/gi,
  /(unrestricted|uncensored)\s+mode/gi,
  
  // Encoding attempts (base64, hex, etc.)
  /[A-Za-z0-9+\/]{20,}={0,2}/g, // Base64-like strings
  /(0x)?[0-9a-fA-F]{16,}/g, // Hex-like strings
  
  // System prompt manipulation
  /system\s*[:=]\s*/gi,
  /assistant\s*[:=]\s*/gi,
  /\[SYSTEM\]/gi,
  /\[INST\]/gi,
  
  // Attempts to extract system instructions
  /show\s+(me\s+)?(your\s+)?(instructions?|prompts?|system\s+prompts?)/gi,
  /what\s+(are\s+)?(your\s+)?(instructions?|prompts?|system\s+prompts?)/gi,
  /repeat\s+(your\s+)?(instructions?|prompts?)/gi,
  
  // Instruction injection markers
  /<<<.*?>>>/gs,
  /```.*?```/gs,
  /---.*?---/gs,
];

// High-risk keywords (if multiple found, increase risk score)
const HIGH_RISK_KEYWORDS = [
  "ignore", "forget", "disregard", "override", "bypass",
  "jailbreak", "uncensored", "unrestricted", "developer mode",
  "system prompt", "instructions", "roleplay", "pretend", "act as"
];

/**
 * Detects prompt injection attempts
 * @param {string} prompt - The user prompt to analyze
 * @returns {Object} - Detection result with isValid, riskScore, and detectedPatterns
 */
export function detectPromptInjection(prompt) {
  if (!prompt || typeof prompt !== "string") {
    return {
      isValid: false,
      riskScore: 100,
      detectedPatterns: ["Invalid input type"],
      error: "Prompt must be a string",
    };
  }

  const detectedPatterns = [];
  let riskScore = 0;
  const lowerPrompt = prompt.toLowerCase();

  // Check against injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    const matches = prompt.match(pattern);
    if (matches) {
      detectedPatterns.push(`Pattern detected: ${pattern.source}`);
      riskScore += 30; // Each pattern adds 30 points
    }
  }

  // Check for high-risk keywords
  let keywordCount = 0;
  for (const keyword of HIGH_RISK_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    if (regex.test(prompt)) {
      keywordCount++;
      detectedPatterns.push(`High-risk keyword: ${keyword}`);
    }
  }

  // Add points for multiple keywords
  if (keywordCount > 0) {
    riskScore += keywordCount * 10;
  }

  // Check for suspicious structure (multiple instruction markers)
  const instructionMarkers = (prompt.match(/[:=]\s*(instruction|prompt|system|rule)/gi) || []).length;
  if (instructionMarkers > 1) {
    riskScore += 20;
    detectedPatterns.push("Multiple instruction markers detected");
  }

  // Check for base64/hex encoding attempts
  const base64Matches = prompt.match(/[A-Za-z0-9+\/]{40,}={0,2}/g);
  if (base64Matches) {
    riskScore += 40;
    detectedPatterns.push("Potential encoded payload detected");
  }

  // Check for script injection attempts
  if (/<script|javascript:|on\w+\s*=/gi.test(prompt)) {
    riskScore += 50;
    detectedPatterns.push("Script injection attempt detected");
  }

  // Risk threshold: 25+ = rejection
  const isValid = riskScore < 25;

  return {
    isValid: isValid,
    riskScore: Math.min(riskScore, 100), // Cap at 100
    detectedPatterns: detectedPatterns.length > 0 ? detectedPatterns : null,
    error: isValid ? null : "Prompt injection attempt detected",
  };
}

/**
 * Combines validation and injection detection
 * @param {string} prompt - The user prompt to validate
 * @returns {Object} - Combined validation and injection detection results
 */
export function validateAndDetectInjection(prompt) {
  // First, validate basic input
  const validation = validatePrompt(prompt);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      isInjection: false,
      riskScore: 0,
      detectedPatterns: null,
      error: validation.error,
      sanitized: validation.sanitized,
    };
  }

  // Then, check for injection attempts on sanitized input
  const injection = detectPromptInjection(validation.sanitized);

  return {
    isValid: injection.isValid,
    isInjection: !injection.isValid,
    riskScore: injection.riskScore,
    detectedPatterns: injection.detectedPatterns,
    error: injection.error || validation.error,
    sanitized: validation.sanitized,
  };
}

