import { ErrorRequestHandler } from "express";
import config from "../config/env.js";
import Errors from "../errors/errors.js";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("Error", err);

  if (err instanceof Errors.HttpError) {
    if (config.isDevelopment) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: err.message, error: err });
      return;
    }
    res.status(err.status).json({ success: false, message: err.message });
    return;
  }

  res.status(500).json({ success: false, message: "Internal Server Error" });
  return;
};

export default errorHandler;
