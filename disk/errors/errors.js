"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestTimeoutError = exports.NotAcceptableError = exports.UnsupportedMediaTypeError = exports.PayloadTooLargeError = exports.NotImplementedError = exports.GatewayTimeoutError = exports.ServiceUnavailableError = exports.InternalServerError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.HttpError = void 0;
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "HttpError";
    }
}
exports.HttpError = HttpError;
class BadRequestError extends HttpError {
    constructor(message) {
        super(400, message);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends HttpError {
    constructor(message) {
        super(401, message);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends HttpError {
    constructor(message) {
        super(403, message);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends HttpError {
    constructor(message) {
        super(404, message);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends HttpError {
    constructor(message) {
        super(409, message);
    }
}
exports.ConflictError = ConflictError;
class InternalServerError extends HttpError {
    constructor(message) {
        super(500, message);
    }
}
exports.InternalServerError = InternalServerError;
class ServiceUnavailableError extends HttpError {
    constructor(message) {
        super(503, message);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
class GatewayTimeoutError extends HttpError {
    constructor(message) {
        super(504, message);
    }
}
exports.GatewayTimeoutError = GatewayTimeoutError;
class NotImplementedError extends HttpError {
    constructor(message) {
        super(501, message);
    }
}
exports.NotImplementedError = NotImplementedError;
class PayloadTooLargeError extends HttpError {
    constructor(message) {
        super(413, message);
    }
}
exports.PayloadTooLargeError = PayloadTooLargeError;
class UnsupportedMediaTypeError extends HttpError {
    constructor(message) {
        super(415, message);
    }
}
exports.UnsupportedMediaTypeError = UnsupportedMediaTypeError;
class NotAcceptableError extends HttpError {
    constructor(message) {
        super(406, message);
    }
}
exports.NotAcceptableError = NotAcceptableError;
class RequestTimeoutError extends HttpError {
    constructor(message) {
        super(408, message);
    }
}
exports.RequestTimeoutError = RequestTimeoutError;
exports.default = {
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
