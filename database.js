const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const ROOT = __dirname;
const SEED_FILE = path.join(ROOT, "data", "db.json");

const emptyData = {
  users: [],
  games: [],
  posts: []
};

function createPoolFromEnv() {
  return new Pool(
    process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false
        }
      : {
          host: process.env.PGHOST || "127.0.0.1",
          port: Number(process.env.PGPORT || 5432),
          database: process.env.PGDATABASE || "gameplayn",
          user: process.env.PGUSER || "postgres",
          password: process.env.PGPASSWORD || "postgres"
        }
  );
}

function createDatabase(pool = createPoolFromEnv(), seedFile = SEED_FILE) {
  async function initDb() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
        bio TEXT NOT NULL DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        genre TEXT NOT NULL DEFAULT 'Nao informado',
        platform TEXT NOT NULL DEFAULT 'Nao informado',
        pinned BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_data TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL,
        pinned BOOLEAN NOT NULL DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS post_likes (
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      );

      CREATE TABLE IF NOT EXISTS comment_likes (
        comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (comment_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_posts_game_id ON posts(game_id);
      CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
    `);

    await pool.query("ALTER TABLE games ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0");
    await pool.query("ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_data TEXT NOT NULL DEFAULT ''");

    const { rows } = await pool.query("SELECT COUNT(*)::int AS total FROM users");
    if (rows[0].total === 0) {
      await writeDb(readSeedData());
    }
  }

  function readSeedData() {
    if (!fs.existsSync(seedFile)) return emptyData;
    return JSON.parse(fs.readFileSync(seedFile, "utf8"));
  }

  async function readDb() {
    const [usersResult, gamesResult, postsResult, postLikesResult, commentsResult, commentLikesResult] = await Promise.all([
      pool.query("SELECT id, name, username, password, role, bio FROM users ORDER BY id"),
      pool.query("SELECT id, name, genre, platform, pinned FROM games ORDER BY sort_order, id"),
      pool.query("SELECT id, game_id, user_id, title, content, image_data, created_at, pinned FROM posts ORDER BY created_at DESC, id"),
      pool.query("SELECT post_id, user_id FROM post_likes"),
      pool.query("SELECT id, post_id, user_id, content, created_at FROM comments ORDER BY created_at, id"),
      pool.query("SELECT comment_id, user_id FROM comment_likes")
    ]);

    const postLikes = groupBy(postLikesResult.rows, "post_id", "user_id");
    const commentLikes = groupBy(commentLikesResult.rows, "comment_id", "user_id");
    const commentsByPost = new Map();

    commentsResult.rows.forEach(comment => {
      const postComments = commentsByPost.get(comment.post_id) || [];
      postComments.push({
        id: comment.id,
        userId: comment.user_id,
        content: comment.content,
        createdAt: toIso(comment.created_at),
        likes: commentLikes.get(comment.id) || []
      });
      commentsByPost.set(comment.post_id, postComments);
    });

    return {
      users: usersResult.rows.map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        password: user.password,
        role: user.role,
        bio: user.bio || ""
      })),
      games: gamesResult.rows.map(game => ({
        id: game.id,
        name: game.name,
        genre: game.genre,
        platform: game.platform,
        pinned: game.pinned
      })),
      posts: postsResult.rows.map(post => ({
        id: post.id,
        gameId: post.game_id,
        userId: post.user_id,
        title: post.title,
        content: post.content,
        imageData: post.image_data || "",
        createdAt: toIso(post.created_at),
        pinned: post.pinned,
        likes: postLikes.get(post.id) || [],
        comments: commentsByPost.get(post.id) || []
      }))
    };
  }

  async function writeDb(db) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM comment_likes");
      await client.query("DELETE FROM post_likes");
      await client.query("DELETE FROM comments");
      await client.query("DELETE FROM posts");
      await client.query("DELETE FROM games");
      await client.query("DELETE FROM users");

      for (const user of db.users || []) {
        await client.query(
          "INSERT INTO users (id, name, username, password, role, bio) VALUES ($1, $2, $3, $4, $5, $6)",
          [user.id, user.name, user.username, user.password, user.role, user.bio || ""]
        );
      }

      for (const [index, game] of (db.games || []).entries()) {
        await client.query(
          "INSERT INTO games (id, name, genre, platform, pinned, sort_order) VALUES ($1, $2, $3, $4, $5, $6)",
          [game.id, game.name, game.genre || "Nao informado", game.platform || "Nao informado", Boolean(game.pinned), index]
        );
      }

      for (const post of db.posts || []) {
        await client.query(
          "INSERT INTO posts (id, game_id, user_id, title, content, image_data, created_at, pinned) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [post.id, post.gameId, post.userId, post.title, post.content, post.imageData || "", post.createdAt, Boolean(post.pinned)]
        );

        for (const userId of post.likes || []) {
          await client.query(
            "INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [post.id, userId]
          );
        }

        for (const comment of post.comments || []) {
          await client.query(
            "INSERT INTO comments (id, post_id, user_id, content, created_at) VALUES ($1, $2, $3, $4, $5)",
            [comment.id, post.id, comment.userId, comment.content, comment.createdAt]
          );

          for (const userId of comment.likes || []) {
            await client.query(
              "INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
              [comment.id, userId]
            );
          }
        }
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async function close() {
    await pool.end?.();
  }

  return {
    initDb,
    readDb,
    writeDb,
    close
  };
}

function createMemoryDatabase(seedFile = SEED_FILE) {
  const { newDb } = require("pg-mem");
  const memoryDb = newDb({ autoCreateForeignKeyIndices: true });
  const { Pool } = memoryDb.adapters.createPg();
  return createDatabase(new Pool(), seedFile);
}

function groupBy(rows, groupKey, valueKey) {
  const grouped = new Map();
  rows.forEach(row => {
    const values = grouped.get(row[groupKey]) || [];
    values.push(row[valueKey]);
    grouped.set(row[groupKey], values);
  });
  return grouped;
}

function toIso(value) {
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

const defaultDatabase = createDatabase();

module.exports = {
  ...defaultDatabase,
  createDatabase,
  createMemoryDatabase
};
