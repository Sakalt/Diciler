//


export const IDENTIFIER_REGEXP = /^(?=.{1,30}$)[a-zA-Z0-9_-]*[a-zA-Z_-]+[a-zA-Z0-9_-]*$/;
export const EMAIL_REGEXP = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function validatePassword(password: string): boolean {
  const length = password.length;
  const predicate = length >= 6 && length <= 50;
  return predicate;
}