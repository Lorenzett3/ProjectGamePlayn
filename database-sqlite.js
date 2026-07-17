const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const SEED_FILE = path.join(DATA_DIR, "db.json");
const SQLITE_FILE = path.join(DATA_DIR, "gameplayn.sqlite");

const emptyData = {
  users: [],
  games: [],
  posts: []
};

function createSqliteDatabase(dbFile = SQLITE_FILE, seedFile = SEED_FILE) {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  const sqlite = new DatabaseSync(dbFile);
  sqlite.exec("PRAGMA foreign_keys = ON");

  function initDb() {
    sqlite.exec(`
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
        pinned INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_data TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        pinned INTEGER NOT NULL DEFAULT 0
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
        created_at TEXT NOT NULL
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

    addColumnIfMissing("games", "sort_order", "INTEGER NOT NULL DEFAULT 0");
    addColumnIfMissing("posts", "image_data", "TEXT NOT NULL DEFAULT ''");

    const total = sqlite.prepare("SELECT COUNT(*) AS total FROM users").get().total;
    if (total === 0) {
      writeDb(readSeedData());
    }
  }

  function readSeedData() {
    if (!fs.existsSync(seedFile)) return emptyData;
    return JSON.parse(fs.readFileSync(seedFile, "utf8"));
  }

  function readDb() {
    const users = sqlite.prepare("SELECT id, name, username, password, role, bio FROM users ORDER BY id").all();
    const games = sqlite.prepare("SELECT id, name, genre, platform, pinned FROM games ORDER BY sort_order, id").all();
    const posts = sqlite.prepare("SELECT id, game_id, user_id, title, content, image_data, created_at, pinned FROM posts ORDER BY created_at DESC, id").all();
    const postLikes = groupBy(sqlite.prepare("SELECT post_id, user_id FROM post_likes").all(), "post_id", "user_id");
    const comments = sqlite.prepare("SELECT id, post_id, user_id, content, created_at FROM comments ORDER BY created_at, id").all();
    const commentLikes = groupBy(sqlite.prepare("SELECT comment_id, user_id FROM comment_likes").all(), "comment_id", "user_id");
    const commentsByPost = new Map();

    comments.forEach(comment => {
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
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        password: user.password,
        role: user.role,
        bio: user.bio || ""
      })),
      games: games.map(game => ({
        id: game.id,
        name: game.name,
        genre: game.genre,
        platform: game.platform,
        pinned: Boolean(game.pinned)
      })),
      posts: posts.map(post => ({
        id: post.id,
        gameId: post.game_id,
        userId: post.user_id,
        title: post.title,
        content: post.content,
        imageData: post.image_data || "",
        createdAt: toIso(post.created_at),
        pinned: Boolean(post.pinned),
        likes: postLikes.get(post.id) || [],
        comments: commentsByPost.get(post.id) || []
      }))
    };
  }

  function writeDb(db) {
    const insertUser = sqlite.prepare("INSERT INTO users (id, name, username, password, role, bio) VALUES (?, ?, ?, ?, ?, ?)");
    const insertGame = sqlite.prepare("INSERT INTO games (id, name, genre, platform, pinned, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
    const insertPost = sqlite.prepare("INSERT INTO posts (id, game_id, user_id, title, content, image_data, created_at, pinned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const insertPostLike = sqlite.prepare("INSERT OR IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)");
    const insertComment = sqlite.prepare("INSERT INTO comments (id, post_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)");
    const insertCommentLike = sqlite.prepare("INSERT OR IGNORE INTO comment_likes (comment_id, user_id) VALUES (?, ?)");

    sqlite.exec("BEGIN");
    try {
      sqlite.exec(`
        DELETE FROM comment_likes;
        DELETE FROM post_likes;
        DELETE FROM comments;
        DELETE FROM posts;
        DELETE FROM games;
        DELETE FROM users;
      `);

      for (const user of db.users || []) {
        insertUser.run(user.id, user.name, user.username, user.password, user.role, user.bio || "");
      }

      for (const [index, game] of (db.games || []).entries()) {
        insertGame.run(game.id, game.name, game.genre || "Nao informado", game.platform || "Nao informado", Boolean(game.pinned) ? 1 : 0, index);
      }

      for (const post of db.posts || []) {
        insertPost.run(post.id, post.gameId, post.userId, post.title, post.content, post.imageData || "", post.createdAt, Boolean(post.pinned) ? 1 : 0);

        for (const userId of post.likes || []) {
          insertPostLike.run(post.id, userId);
        }

        for (const comment of post.comments || []) {
          insertComment.run(comment.id, post.id, comment.userId, comment.content, comment.createdAt);

          for (const userId of comment.likes || []) {
            insertCommentLike.run(comment.id, userId);
          }
        }
      }

      sqlite.exec("COMMIT");
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }
  }

  function close() {
    sqlite.close();
  }

  function addColumnIfMissing(tableName, columnName, definition) {
    const columns = sqlite.prepare(`PRAGMA table_info(${tableName})`).all();
    if (!columns.some(column => column.name === columnName)) {
      sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    }
  }

  return {
    initDb,
    readDb,
    writeDb,
    close
  };
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

module.exports = {
  createSqliteDatabase
};
