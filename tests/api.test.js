const test = require("node:test");
const assert = require("node:assert/strict");
const { createAppServer } = require("../server");
const { createTestDatabase, tinyPng } = require("./testUtils");

test("api supports auth, posts, comments, likes and admin actions", async () => {
  const { database, cleanup } = await createTestDatabase();
  const server = createAppServer(database);
  const baseUrl = await listen(server);

  try {
    const failedLogin = await request(baseUrl, "/api/login", {
      method: "POST",
      body: { username: "player", password: "wrong" }
    });
    assert.equal(failedLogin.status, 401);

    const publicPosts = await request(baseUrl, "/api/posts");
    assert.equal(publicPosts.status, 200);
    assert.equal(publicPosts.body.posts.length, 1);

    const publicLike = await request(baseUrl, "/api/posts/p1/like", { method: "POST" });
    assert.equal(publicLike.status, 401);

    const register = await request(baseUrl, "/api/register", {
      method: "POST",
      body: { name: "New User", username: "newuser", password: "newuser123" }
    });
    assert.equal(register.status, 201);
    assert.equal(register.body.user.role, "user");
    assert.equal(register.body.user.password, undefined);

    const login = await request(baseUrl, "/api/login", {
      method: "POST",
      body: { username: "player", password: "123456" }
    });
    assert.equal(login.status, 200);
    assert.equal(login.body.token, "u1");
    assert.equal(login.body.user.password, undefined);

    const token = login.body.token;
    const adminLogin = await request(baseUrl, "/api/login", {
      method: "POST",
      body: { username: "admin", password: "admin123" }
    });
    const adminToken = adminLogin.body.token;

    const session = await request(baseUrl, "/api/session", {}, token);
    assert.equal(session.status, 200);
    assert.equal(session.body.user.username, "player");
    assert.equal(session.body.user.password, undefined);

    const games = await request(baseUrl, "/api/games", {}, token);
    assert.equal(games.status, 200);
    assert.equal(games.body.games[0].id, "g2");
    assert.equal(games.body.games[0].postCount, 0);

    const createPost = await request(baseUrl, "/api/posts", {
      method: "POST",
      body: {
        gameId: "g1",
        title: "API test post",
        content: "API test content",
        imageData: tinyPng
      }
    }, token);
    assert.equal(createPost.status, 201);
    assert.equal(createPost.body.post.author.username, "player");
    assert.equal(createPost.body.post.game.id, "g1");
    assert.equal(createPost.body.post.imageData, tinyPng);

    const postId = createPost.body.post.id;
    const invalidImage = await request(baseUrl, "/api/posts", {
      method: "POST",
      body: {
        gameId: "g1",
        title: "Invalid image",
        content: "Invalid image content",
        imageData: "data:text/plain;base64,SGVsbG8="
      }
    }, token);
    assert.equal(invalidImage.status, 400);

    const liked = await request(baseUrl, `/api/posts/${postId}/like`, { method: "POST" }, token);
    assert.equal(liked.status, 200);
    assert.equal(liked.body.post.likes.length, 1);

    const commented = await request(baseUrl, `/api/posts/${postId}/comments`, {
      method: "POST",
      body: { content: "API comment" }
    }, token);
    assert.equal(commented.status, 201);
    assert.equal(commented.body.post.comments.length, 1);

    const commentId = commented.body.post.comments[0].id;
    const otherLogin = await request(baseUrl, "/api/login", {
      method: "POST",
      body: { username: "other", password: "other123" }
    });
    const otherToken = otherLogin.body.token;

    const forbiddenDelete = await request(baseUrl, `/api/posts/${postId}/comments/${commentId}`, {
      method: "DELETE"
    }, otherToken);
    assert.equal(forbiddenDelete.status, 403);

    const deletedComment = await request(baseUrl, `/api/posts/${postId}/comments/${commentId}`, {
      method: "DELETE"
    }, token);
    assert.equal(deletedComment.status, 200);
    assert.equal(deletedComment.body.post.comments.length, 0);

    const users = await request(baseUrl, "/api/users", {}, adminToken);
    assert.equal(users.status, 200);
    assert.equal(users.body.users.length, 4);
    assert.equal(users.body.users[0].password, undefined);

    const newUser = users.body.users.find(user => user.username === "newuser");
    const promoted = await request(baseUrl, `/api/users/${newUser.id}`, {
      method: "PATCH",
      body: {
        name: newUser.name,
        username: newUser.username,
        role: "admin",
        bio: newUser.bio || ""
      }
    }, adminToken);
    assert.equal(promoted.status, 200);
    assert.equal(promoted.body.user.role, "admin");

    const createGame = await request(baseUrl, "/api/games", {
      method: "POST",
      body: {
        name: "Portal 2",
        genre: "Puzzle",
        platform: "PC"
      }
    }, adminToken);
    assert.equal(createGame.status, 201);
    assert.equal(createGame.body.game.name, "Portal 2");
  } finally {
    await closeServer(server);
    await cleanup();
  }
});

async function listen(server) {
  return new Promise(resolve => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve(`http://${address.address}:${address.port}`);
    });
  });
}

async function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close(error => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function request(baseUrl, path, options = {}, token = "") {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const body = await response.json();
  return {
    status: response.status,
    body
  };
}
