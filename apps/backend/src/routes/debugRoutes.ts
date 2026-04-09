import express from "express";
import { buildXAuthorizationUrl, createOAuthState, createPkcePair } from "../lib/xOAuth.js";
import { config } from "../appRuntime.js";

export function registerDebugRoutes(app: express.Router) {
  app.get("/debug/x-oauth", (_request, response) => {
    const { codeChallenge } = createPkcePair();
    const state = createOAuthState();

    response.json({
      host: config.host ?? null,
      callbackUrl: config.xOAuth.callbackUrl,
      clientType: config.xOAuth.clientType,
      clientId: config.xOAuth.clientId,
      hasClientSecret: Boolean(config.xOAuth.clientSecret),
      scopes: config.xOAuth.scopes,
      authorizationUrl: buildXAuthorizationUrl(state, codeChallenge)
    });
  });
}
