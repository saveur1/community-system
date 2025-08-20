import { User } from "@/api/auth";

export const spacer = (word: string) => {
  return word.replace(/_/g, ' ');
}

export const checkPermissions=(user: User | null, permission: string) => {
  if(user?.roles[0].permissions?.some(p => p.name === permission)) {
    return true;
  }
  return false;
}