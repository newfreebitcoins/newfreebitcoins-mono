import express from "express";
import { setCorsHeaders } from "../appRuntime.js";

export function registerGlobalMiddleware(app: express.Router) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use((request, response, next) => {
    setCorsHeaders(response);

    if (request.method === "OPTIONS") {
      response.status(204).end();
      return;
    }

    next();
  });
}
