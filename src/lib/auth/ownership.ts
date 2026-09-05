export class OwnershipError extends Error {
  constructor() {
    super("The requested record is not owned by the signed-in user.");
    this.name = "OwnershipError";
  }
}

export function assertOwnedByUser(ownerId: string, userId: string): void {
  if (ownerId !== userId) {
    throw new OwnershipError();
  }
}
