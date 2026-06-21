import { NextResponse } from "next/server";
import { learnerCookieName, getLearnerId } from "@/lib/learner";
import { listCompletedNotes, setNoteCompleted } from "@/lib/progress-db";

type ProgressBody = {
  completed?: boolean;
  slug?: string;
};

function withLearnerCookie(response: NextResponse, learnerId: string) {
  response.cookies.set(learnerCookieName, learnerId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function databaseNotConfiguredResponse(learnerId: string) {
  return withLearnerCookie(
    NextResponse.json(
      {
        completed: [],
        databaseConfigured: false,
        message: "DATABASE_URL is not configured.",
      },
      { status: 200 },
    ),
    learnerId,
  );
}

export async function GET() {
  const learnerId = await getLearnerId();

  try {
    const completed = await listCompletedNotes(learnerId);
    return withLearnerCookie(NextResponse.json({ completed, databaseConfigured: true }), learnerId);
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return databaseNotConfiguredResponse(learnerId);
    }

    console.error(error);
    return withLearnerCookie(NextResponse.json({ error: "Failed to load progress." }, { status: 500 }), learnerId);
  }
}

export async function POST(request: Request) {
  const learnerId = await getLearnerId();
  const body = (await request.json()) as ProgressBody;

  if (!body.slug || typeof body.completed !== "boolean") {
    return withLearnerCookie(NextResponse.json({ error: "slug and completed are required." }, { status: 400 }), learnerId);
  }

  try {
    const completed = await setNoteCompleted(learnerId, body.slug, body.completed);
    return withLearnerCookie(NextResponse.json({ completed, databaseConfigured: true }), learnerId);
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return databaseNotConfiguredResponse(learnerId);
    }

    console.error(error);
    return withLearnerCookie(NextResponse.json({ error: "Failed to save progress." }, { status: 500 }), learnerId);
  }
}
