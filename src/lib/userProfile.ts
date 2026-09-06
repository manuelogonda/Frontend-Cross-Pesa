export interface AuthUserLike {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  sub?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthUserSource {
  response?: AuthUserLike | null;
  submitted?: AuthUserLike | null;
  tokenPayload?: AuthUserLike | null;
}

const capitalizeFirst = (value: string) => value.trim().charAt(0).toUpperCase() + value.trim().slice(1);

const splitName = (value?: string) => {
  const cleaned = value?.trim().replace(/\s+/g, ' ') ?? '';
  if (!cleaned) return { firstName: '', lastName: '' };

  const parts = cleaned.split(' ');
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
};

const firstNonEmpty = (...values: Array<string | undefined | null>) =>
  values.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim() ?? '';

const deriveNameFromEmail = (email?: string) => {
  const localPart = email?.trim().split('@')[0] ?? '';
  if (!localPart) return '';

  const segments = localPart.split(/[._-]+/).filter(Boolean);
  if (segments.length === 0) return capitalizeFirst(localPart);
  if (segments.length === 1) return capitalizeFirst(segments[0] ?? '');

  return segments.map((segment) => capitalizeFirst(segment)).join(' ');
};

export const buildInitials = (
  firstName?: string,
  lastName?: string,
  email?: string
): string => {
  const first = firstName?.trim()?.charAt(0)?.toUpperCase() ?? '';
  const last = lastName?.trim()?.charAt(0)?.toUpperCase() ?? '';
  const initials = `${first}${last}`.trim();
  if (initials) return initials;

  const splitSource = firstNonEmpty(firstName, lastName, email);
  if (splitSource) {
    const tokens = splitSource.split(/\s+/);
    const fromTokens = tokens
      .filter(Boolean)
      .slice(0, 2)
      .map((token) => token.charAt(0).toUpperCase())
      .join('');
    if (fromTokens) return fromTokens;
  }

  return email?.trim()?.charAt(0)?.toUpperCase() ?? '?';
};

export const normalizeAuthUser = (source: AuthUserSource): AuthUser => {
  const response = source.response ?? {};
  const submitted = source.submitted ?? {};
  const tokenPayload = source.tokenPayload ?? {};

  const preferredName = firstNonEmpty(
    response.firstName,
    submitted.firstName,
    tokenPayload.firstName,
    tokenPayload.given_name,
    tokenPayload.name,
    tokenPayload.preferred_username
  );

  const responseLastName = firstNonEmpty(
    response.lastName,
    submitted.lastName,
    tokenPayload.lastName,
    tokenPayload.family_name
  );

  const splitFromName = splitName(tokenPayload.name);
  const splitFromPreferred = splitName(tokenPayload.preferred_username);
  const splitFromFirst = splitName(preferredName);

  const firstName = capitalizeFirst(
    firstNonEmpty(
      preferredName,
      splitFromName.firstName,
      splitFromPreferred.firstName,
      splitFromFirst.firstName,
      deriveNameFromEmail(firstNonEmpty(response.email, submitted.email, tokenPayload.email)),
    )
  );

  const lastName = capitalizeFirst(
    firstNonEmpty(
      responseLastName,
      splitFromName.lastName,
      splitFromPreferred.lastName,
      splitFromFirst.lastName,
    )
  );

  const email = firstNonEmpty(response.email, submitted.email, tokenPayload.email);
  const role = firstNonEmpty(response.role, submitted.role, tokenPayload.role, 'USER');
  const id = firstNonEmpty(response.id, tokenPayload.sub, email, firstName, 'user');

  return {
    id,
    email,
    firstName,
    lastName,
    role,
  };
};
