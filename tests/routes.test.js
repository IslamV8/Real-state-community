require("dotenv").config();
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../app");

let mongoServer;
let cookie;
let ids = {};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Real Estate Community API", () => {
  const rnd = Math.floor(Math.random() * 1e8);
  const testUser = {
    username: `u${rnd}`,
    displayName: `User ${rnd}`,
    email: `u${rnd}@test.com`,
    password: "Password123!",
  };

  test("POST /api/auth/register → 201 + set cookie", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser)
      .expect(201);
    expect(res.body).toHaveProperty("id");
    expect(res.headers["set-cookie"]).toBeDefined();
    cookie = res.headers["set-cookie"];
    ids.userId = res.body.id;
  });

  test("POST /api/auth/login → 200 + set cookie", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: testUser.username, password: testUser.password })
      .expect(200);
    expect(res.body).toHaveProperty("id", ids.userId);
    expect(res.headers["set-cookie"]).toBeDefined();
    cookie = res.headers["set-cookie"];
  });

  test("POST /api/auth/forgot-password → 200", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: testUser.email })
      .expect(200);
    expect(res.body).toHaveProperty("message");
  });

  test("POST /api/auth/reset-password → 400 (invalid token)", async () => {
    await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "badtoken", newPassword: "NewPass123!" })
      .expect(400);
  });

  test("GET /api/properties (empty) → 200", async () => {
    await request(app)
      .get("/api/properties")
      .set("Cookie", cookie)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("properties");
        expect(Array.isArray(res.body.properties)).toBe(true);
      });
  });

  test("POST /api/properties → 201", async () => {
    const payload = {
      title: "Test Prop",
      description: "Test Description",
      price: 100,
      city: "Test City",
      state: "California",
      type: "house",
      forSale: true,
      images: [],
    };
    const res = await request(app)
      .post("/api/properties")
      .set("Cookie", cookie)
      .send(payload)
      .expect(201);
    expect(res.body).toHaveProperty("_id");
    ids.propertyId = res.body._id;
  });

  test("GET /api/properties/:id → 200", async () => {
    await request(app)
      .get(`/api/properties/${ids.propertyId}`)
      .set("Cookie", cookie)
      .expect(200);
  });

  test("PUT /api/properties/:id → 200", async () => {
    await request(app)
      .put(`/api/properties/${ids.propertyId}`)
      .set("Cookie", cookie)
      .send({ price: 200 })
      .expect(200)
      .then((res) => expect(res.body.price).toBe(200));
  });

  test("POST /api/properties/:id/images → 200", async () => {
    await request(app)
      .post(`/api/properties/${ids.propertyId}/images`)
      .set("Cookie", cookie)
      .attach("images", Buffer.from(""), "blank.png")
      .expect(200);
  });

  test("POST /api/comments/:propertyId → 201", async () => {
    const res = await request(app)
      .post(`/api/comments/${ids.propertyId}`)
      .set("Cookie", cookie)
      .send({ content: "Nice!" })
      .expect(201);
    expect(res.body).toHaveProperty("_id");
    ids.commentId = res.body._id;
  });

  test("GET /api/comments/:propertyId → 200", async () => {
    await request(app)
      .get(`/api/comments/${ids.propertyId}`)
      .set("Cookie", cookie)
      .expect(200);
  });

  test("PUT /api/comments/:id → 200", async () => {
    await request(app)
      .put(`/api/comments/${ids.commentId}`)
      .set("Cookie", cookie)
      .send({ content: "Updated!" })
      .expect(200);
  });

  test("POST /api/likes → 201", async () => {
    const res = await request(app)
      .post("/api/likes")
      .set("Cookie", cookie)
      .send({ propertyId: ids.propertyId })
      .expect(201);
    expect(res.body).toHaveProperty("liked");
    ids.likeId = res.body.likeId;
  });

  test("GET /api/likes/property/:propertyId → 200", async () => {
    await request(app)
      .get(`/api/likes/property/${ids.propertyId}`)
      .set("Cookie", cookie)
      .expect(200);
  });

  test("DELETE /api/likes/:id → 200", async () => {
    await request(app)
      .delete(`/api/likes/${ids.likeId}`)
      .set("Cookie", cookie)
      .expect(200);
  });

  test("POST /api/bookmarks → 201", async () => {
    const res = await request(app)
      .post("/api/bookmarks")
      .set("Cookie", cookie)
      .send({ propertyId: ids.propertyId })
      .expect(201);
    ids.bookmarkId = res.body._id;
  });

  test("GET /api/bookmarks → 200", async () => {
    await request(app).get("/api/bookmarks").set("Cookie", cookie).expect(200);
  });

  test("DELETE /api/bookmarks/:id → 200", async () => {
    await request(app)
      .delete(`/api/bookmarks/${ids.bookmarkId}`)
      .set("Cookie", cookie)
      .expect(200);
  });

  test("POST /api/messages → 201", async () => {
    const res = await request(app)
      .post("/api/messages")
      .set("Cookie", cookie)
      .send({ receiverId: ids.userId, content: "Hello!" })
      .expect(201);
    ids.messageId = res.body._id;
  });

  test("GET /api/messages/:withUserId → 200", async () => {
    await request(app)
      .get(`/api/messages/${ids.userId}`)
      .set("Cookie", cookie)
      .expect(200);
  });

  test("DELETE /api/messages/:id → 200", async () => {
    await request(app)
      .delete(`/api/messages/${ids.messageId}`)
      .set("Cookie", cookie)
      .expect(200);
  });

  describe("Admin-only routes", () => {
    test("GET /api/admin/users → 200", async () => {
      await request(app)
        .get("/api/admin/users")
        .set("Cookie", cookie)
        .expect(200);
    });

    test("PUT /api/admin/users/:id/promote → 200", async () => {
      await request(app)
        .put(`/api/admin/users/${ids.userId}/promote`)
        .set("Cookie", cookie)
        .expect(200);
    });

    test("PUT /api/admin/users/:id/demote → 200", async () => {
      await request(app)
        .put(`/api/admin/users/${ids.userId}/demote`)
        .set("Cookie", cookie)
        .expect(200);
    });

    test("DELETE /api/admin/users/:id → 200", async () => {
      await request(app)
        .delete(`/api/admin/users/${ids.userId}`)
        .set("Cookie", cookie)
        .expect(200);
    });

    test("DELETE /api/admin/property/:id → 200", async () => {
      await request(app)
        .delete(`/api/admin/property/${ids.propertyId}`)
        .set("Cookie", cookie)
        .expect(200);
    });

    test("DELETE /api/admin/comment/:id → 200", async () => {
      await request(app)
        .delete(`/api/admin/comment/${ids.commentId}`)
        .set("Cookie", cookie)
        .expect(200);
    });

    test("DELETE /api/admin/message/:id → 200", async () => {
      await request(app)
        .delete(`/api/admin/message/${ids.messageId}`)
        .set("Cookie", cookie)
        .expect(200);
    });
  });

  test("DELETE /api/properties/:id → 200 (cleanup)", async () => {
    await request(app)
      .delete(`/api/properties/${ids.propertyId}`)
      .set("Cookie", cookie)
      .expect(200);
  });
});
