class DBError extends Error {
  constructor(message = "Database error occurred") {
    super(message);
    this.name = "DBError";
  }
}

class UserNotExistError extends Error {
  constructor(username) {
    super(`User with username '${username}' does not exist`);
    this.name = "UserNotExistError";
  }
}

class ValidationError extends Error {
  constructor(message = "Validation failed") {
    super(message);
    this.name = "ValidationError";
  }
}

class UnauthorizedError extends Error {
  constructor(message = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

class ConflictError extends Error {
  constructor(message = "Conflict: Resource already exists") {
    super(message);
    this.name = "ConflictError";
  }
}

module.exports = {
  DBError,
  UserNotExistError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
};
