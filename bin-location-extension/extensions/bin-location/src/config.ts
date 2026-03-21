/**
 * Extension configuration
 * 
 * NOTE: Shopify Admin UI Extensions run in a browser sandbox without access to process.env.
 * This file provides build-time configuration values.
 */

export const APP_URL = process.env.APP_URL ?? "https://ezoko-frontend-test.up.railway.app";