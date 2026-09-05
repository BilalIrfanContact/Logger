export async function deleteCurrentAccount(dependencies: {
  getCurrentUser: () => Promise<{ id: string } | null>;
  deleteUser: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}): Promise<boolean> {
  const user = await dependencies.getCurrentUser();
  if (!user) {
    return false;
  }

  await dependencies.deleteUser(user.id);
  try {
    await dependencies.signOut();
  } catch {
    // Auth deletion already revoked the account; a stale browser cookie is harmless.
  }
  return true;
}
