class DBError extends Error {
  constructor(message = "Database error occurred") {
    super(message);
    this.name = "DBError";
  }
}

// Error that occurs when user does not exists
class UserNotExistError extends Error {
  constructor(username) {
    super(`User with username '${username}' does not exist`);
    this.name = "UserNotExistError";
  }
}

// Error that occurs if validation fails
class ValidationError extends Error {
  constructor(message = "Validation failed") {
    super(message);
    this.name = "ValidationError";
  }
}

// Error that occurs when user is unauthorized
class UnauthorizedError extends Error {
  constructor(message = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

// Error that occurs in case of conflict
class ConflictError extends Error {
  constructor(message = "Conflict: Resource already exists") {
    super(message);
    this.name = "ConflictError";
  }
}

// Exporting errors
module.exports = {
  DBError,
  UserNotExistError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
};
