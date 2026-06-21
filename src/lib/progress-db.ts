import { Pool } from "pg";

type LearningRecordRow = {
  note_slug: string;
  completed_at: Date;
};

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

let pool: Pool | undefined;
let schemaReady: Promise<void> | undefined;

function getPool() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  pool ??= new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  return pool;
}

async function ensureSchema() {
  schemaReady ??= getPool().query(`
    create table if not exists learning_records (
      learner_id text not null,
      note_slug text not null,
      completed_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      primary key (learner_id, note_slug)
    );
  `).then(() => undefined);

  return schemaReady;
}

export async function listCompletedNotes(learnerId: string) {
  await ensureSchema();

  const result = await getPool().query<LearningRecordRow>(
    "select note_slug, completed_at from learning_records where learner_id = $1 order by completed_at desc",
    [learnerId],
  );

  return result.rows.map((row) => ({
    noteSlug: row.note_slug,
    completedAt: row.completed_at.toISOString(),
  }));
}

export async function setNoteCompleted(learnerId: string, noteSlug: string, completed: boolean) {
  await ensureSchema();

  if (completed) {
    await getPool().query(
      `
        insert into learning_records (learner_id, note_slug, completed_at, updated_at)
        values ($1, $2, now(), now())
        on conflict (learner_id, note_slug)
        do update set completed_at = excluded.completed_at, updated_at = now()
      `,
      [learnerId, noteSlug],
    );
  } else {
    await getPool().query("delete from learning_records where learner_id = $1 and note_slug = $2", [learnerId, noteSlug]);
  }

  return listCompletedNotes(learnerId);
}
