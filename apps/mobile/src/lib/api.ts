/**
 * API Module - DEPRECATED
 * This file now re-exports from the modular API structure.
 * Import from "../lib/api" still works for backward compatibility.
 *
 * New imports should use:
 *   import { login } from "../lib/api/auth"
 *   import { fetchFeed } from "../lib/api/feed"
 *   etc.
 */

// Re-export everything from the new modular structure
export * from "./api/index";
