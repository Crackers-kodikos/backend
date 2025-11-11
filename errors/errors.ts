export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string) {
    super(500, message);
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message: string) {
    super(503, message);
  }
}

export class GatewayTimeoutError extends HttpError {
  constructor(message: string) {
    super(504, message);
  }
}

export class NotImplementedError extends HttpError {
  constructor(message: string) {
    super(501, message);
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(message: string) {
    super(413, message);
  }
}

export class UnsupportedMediaTypeError extends HttpError {
  constructor(message: string) {
    super(415, message);
  }
}

export class NotAcceptableError extends HttpError {
  constructor(message: string) {
    super(406, message);
  }
}

export class RequestTimeoutError extends HttpError {
  constructor(message: string) {
    super(408, message);
  }
}

export default {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  NotImplementedError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
  NotAcceptableError,
  RequestTimeoutError,
};
