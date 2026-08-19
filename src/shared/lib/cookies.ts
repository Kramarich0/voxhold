export async function getClientCookie(name: string): Promise<string | null> {
  try {
    const cookie = await cookieStore.get(name);
    return cookie?.value ?? null;
  } catch (error) {
    console.error(`Failed to read cookie "${name}":`, error);
    return null;
  }
}

export async function setClientCookie(
  name: string,
  value: boolean | string,
  maxAge: number,
): Promise<void> {
  try {
    await cookieStore.set({
      name,
      value: String(value),
      path: "/",
      sameSite: "lax",
      expires: Date.now() + maxAge,
    });
    return;
  } catch (error) {
    console.error(`Failed to write cookie "${name}":`, error);
  }
}

export async function deleteClientCookie(name: string): Promise<void> {
  try {
    await cookieStore.delete(name);
    return;
  } catch (error) {
    console.error(`Failed to delete cookie "${name}":`, error);
  }
}
