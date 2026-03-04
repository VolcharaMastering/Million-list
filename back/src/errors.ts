// Error thrown when creating an item that already exists.
export class ItemExistsError extends Error {
  constructor(message = "Item with this id already exists") {
    super(message);
    this.name = "ItemExistsError";
    Object.setPrototypeOf(this, ItemExistsError.prototype);
  }
}

// 400 when body is wrong or nothing could be added (invalid ids or all duplicates).
export class BadRequestError extends Error {
  constructor(
    message: string,
    public readonly details?: { invalid?: unknown[]; alreadyExists?: number[] }
  ) {
    super(message);
    this.name = "BadRequestError";
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
