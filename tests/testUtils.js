const fs = require("fs");
const os = require("os");
const path = require("path");
const { newDb } = require("pg-mem");
const { createDatabase } = require("../database");

const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

const baseSeed = {
  users: [
    {
      id: "u1",
      name: "Player One",
      username: "player",
      password: "123456",
      role: "user",
      bio: "Main test user"
    },
    {
      id: "u2",
      name: "Admin",
      username: "admin",
      password: "admin123",
      role: "admin",
      bio: "Admin test user"
    },
    {
      id: "u3",
      name: "Other User",
      username: "other",
      password: "other123",
      role: "user",
      bio: "Secondary user"
    }
  ],
  games: [
    {
      id: "g1",
      name: "Minecraft",
      genre: "Sandbox",
      platform: "PC",
      pinned: false
    },
    {
      id: "g2",
      name: "Elden Ring",
      genre: "RPG",
      platform: "PC, PlayStation, Xbox",
      pinned: true
    }
  ],
  posts: [
    {
      id: "p1",
      gameId: "g1",
      userId: "u1",
      title: "Seed post",
      content: "Seed content",
      imageData: tinyPng,
      createdAt: "2026-01-02T03:04:05.000Z",
      pinned: false,
      likes: ["u2"],
      comments: [
        {
          id: "c1",
          userId: "u2",
          content: "Seed comment",
          createdAt: "2026-01-02T04:04:05.000Z",
          likes: ["u1"]
        }
      ]
    }
  ]
};

async function createTestDatabase(seed = baseSeed) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gameplayn-test-"));
  const seedFile = path.join(dir, "db.json");
  fs.writeFileSync(seedFile, JSON.stringify(seed, null, 2));

  const memoryDb = newDb({ autoCreateForeignKeyIndices: true });
  const { Pool } = memoryDb.adapters.createPg();
  const pool = new Pool();
  const database = createDatabase(pool, seedFile);

  await database.initDb();

  return {
    database,
    seed,
    cleanup: async () => {
      await database.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  };
}

module.exports = {
  baseSeed,
  createTestDatabase,
  tinyPng
};
