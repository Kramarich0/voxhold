export function getInitials(name?: string | null, email?: string | null): string {
  const [first, second] = name?.trim().split(/\s+/) ?? [];

  if (first != null && second != null) {
    return (first.charAt(0) + second.charAt(0)).toUpperCase();
  }

  if (first != null) {
    return first.charAt(0).toUpperCase();
  }

  if (email?.trim()) {
    return email.trim().charAt(0).toUpperCase();
  }

  return "U";
}
