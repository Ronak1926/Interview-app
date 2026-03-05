type CacheTag = "users" | "jobInfos" | "interviews" | "quetions";

export function getGlobalTag(tag: CacheTag) {
  return `global: ${tag}` as const;
}

export function getUserTag(tag: CacheTag, userId: string) {
  return `user: ${userId}: ${tag}` as const;
}

export function getJobInfoTag(tag: CacheTag, jobInfoId: string) {
  return `JobInfo ${jobInfoId}:${tag}` as const
}

export function getIdTag(tag: CacheTag, id: string) {
  return `id: ${id}: ${tag}` as const;
}
