import { cookies } from "next/headers";

export const learnerCookieName = "cs_notes_learner_id";

export async function getLearnerId() {
  const cookieStore = await cookies();
  return cookieStore.get(learnerCookieName)?.value ?? crypto.randomUUID();
}
