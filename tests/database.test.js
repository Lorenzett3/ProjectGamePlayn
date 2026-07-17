const test = require("node:test");
const assert = require("node:assert/strict");
const { createTestDatabase, tinyPng } = require("./testUtils");

test("database imports seed and preserves relational data", async () => {
  const { database, cleanup } = await createTestDatabase();

  try {
    const db = await database.readDb();

    assert.equal(db.users.length, 3);
    assert.equal(db.games.length, 2);
    assert.equal(db.games[0].id, "g1");
    assert.equal(db.posts.length, 1);
    assert.equal(db.posts[0].likes[0], "u2");
    assert.equal(db.posts[0].imageData, tinyPng);
    assert.equal(db.posts[0].comments[0].likes[0], "u1");
    assert.equal(db.posts[0].createdAt, "2026-01-02T03:04:05.000Z");
  } finally {
    await cleanup();
  }
});

test("database writeDb persists updates and enforces foreign keys", async () => {
  const { database, cleanup } = await createTestDatabase();

  try {
    const db = await database.readDb();
    db.games.unshift({
      id: "g3",
      name: "Portal 2",
      genre: "Puzzle",
      platform: "PC",
      pinned: false
    });
    db.posts.unshift({
      id: "p2",
      gameId: "g3",
      userId: "u3",
      title: "New post",
      content: "New content",
      imageData: tinyPng,
      createdAt: "2026-01-03T03:04:05.000Z",
      pinned: true,
      likes: ["u1", "u2"],
      comments: []
    });

    await database.writeDb(db);

    const saved = await database.readDb();
    assert.equal(saved.games[0].id, "g3");
    assert.equal(saved.posts[0].id, "p2");
    assert.equal(saved.posts[0].imageData, tinyPng);
    assert.deepEqual(saved.posts[0].likes.sort(), ["u1", "u2"]);

    const invalid = await database.readDb();
    invalid.posts.push({
      id: "bad-post",
      gameId: "missing-game",
      userId: "u1",
      title: "Invalid",
      content: "Invalid",
      imageData: "",
      createdAt: "2026-01-04T03:04:05.000Z",
      pinned: false,
      likes: [],
      comments: []
    });

    await assert.rejects(() => database.writeDb(invalid));
  } finally {
    await cleanup();
  }
});
