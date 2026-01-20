import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function revalidateUserCache(id: string) {
  revalidateTag(getUserIdTag(id), "default");
  revalidateTag(getUserGlobalTag(), "default");
}

export function getUserGlobalTag() {
  return getGlobalTag("users");
}

export function getUserIdTag(id: string) {
  return getIdTag("users", id);
}
