import { GuildMember } from "discord.js";

/**
 * Admin role ID (Ninja role).
 */
const ADMIN_ROLE_ID = "1308506554290405449";

/**
 * Checks if a guild member has admin privileges.
 * Admin = Ninja role holder.
 */
export function isAdmin(member: GuildMember | null): boolean {
  if (!member) return false;
  return member.roles.cache.has(ADMIN_ROLE_ID);
}
