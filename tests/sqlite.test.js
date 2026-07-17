const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { createSqliteDatabase } = require("../database-sqlite");
const { baseSeed, tinyPng } = require("./testUtils");

test("sqlite database persists data in a local file", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gameplayn-sqlite-test-"));
  const seedFile = path.join(dir, "db.json");
  const dbFile = path.join(dir, "gameplayn.sqlite");
  fs.writeFileSync(seedFile, JSON.stringify(baseSeed, null, 2));

  const database = createSqliteDatabase(dbFile, seedFile);

  try {
    database.initDb();
    const db = database.readDb();
    assert.equal(db.users.length, 3);
    assert.equal(db.posts[0].imageData, tinyPng);

    db.posts.unshift({
      id: "sqlite-post",
      gameId: "g1",
      userId: "u1",
      title: "SQLite post",
      content: "Persistent content",
      imageData: "",
      createdAt: "2026-01-05T03:04:05.000Z",
      pinned: false,
      likes: [],
      comments: []
    });
    database.writeDb(db);
    database.close();

    const reopened = createSqliteDatabase(dbFile, seedFile);
    reopened.initDb();
    const saved = reopened.readDb();
    assert.equal(saved.posts[0].id, "sqlite-post");
    reopened.close();
  } finally {
    try {
      database.close();
    } catch {
      // Already closed during the persistence check.
    }
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
