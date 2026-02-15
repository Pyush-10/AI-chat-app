import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import ImageKit from "imagekit";
import mongoose from "mongoose";

import Chat from "./models/chats.js";
import UserChats from "./models/userChats.js";

import { clerkMiddleware, requireAuth } from "@clerk/express";

const port = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------ MIDDLEWARE ------------------ */

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(clerkMiddleware());

/* ------------------ DB ------------------ */

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

/* ------------------ IMAGEKIT ------------------ */

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

/* ------------------ ROUTES ------------------ */

app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

/* CREATE CHAT */
app.post("/api/chats", requireAuth(), async (req, res) => {
  const { userId } = req.auth; // FIX: Correct usage for Clerk
  const { text } = req.body;

  try {
    const newChat = new Chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();

    const userChats = await UserChats.find({ userId: userId });

    if (!userChats.length) {
      const newUserChats = new UserChats({
        userId: userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });

      await newUserChats.save();
    } else {
      await UserChats.updateOne(
        { userId: userId },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 40),
            },
          },
        },
      );
    }

    res.status(201).send(savedChat._id);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating chat!");
  }
});

/* GET USER CHATS */
app.get("/api/userchats", requireAuth(), async (req, res) => {
  const { userId } = req.auth;

  try {
    const userChats = await UserChats.find({ userId });

    if (!userChats.length || !userChats[0].chats) {
      return res.status(200).send([]);
    }

    res.status(200).send(userChats[0].chats);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching userchats!");
  }
});

/* GET SINGLE CHAT */
app.get("/api/chats/:id", requireAuth(), async (req, res) => {
  const { userId } = req.auth;

  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId });
    res.status(200).send(chat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chat!");
  }
});

/* UPDATE CHAT (DEBUG VERSION) */
app.put("/api/chats/:id", requireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const { question, answer, img } = req.body;

  // --- DEBUG LOGS ---
  console.log("--- ATTEMPTING SAVE ---");
  console.log("Chat ID:", req.params.id);
  console.log("User ID:", userId);
  console.log("Question:", question);
  console.log("Answer Length:", answer?.length);

  const newItems = [
    ...(question
      ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
      : []),
    { role: "model", parts: [{ text: answer }] },
  ];

  try {
    const updatedChat = await Chat.updateOne(
      { _id: req.params.id, userId },
      {
        $push: {
          history: { $each: newItems },
        },
      },
    );
    console.log("MongoDB Result:", updatedChat);
    res.status(200).send(updatedChat);
  } catch (err) {
    console.log("❌ SERVER ERROR:", err);
    res.status(500).send("Error adding conversation!");
  }
});

/* ------------------ ERROR HANDLER ------------------ */

// SAFE 404 HANDLER (Replaces the broken one)
app.use((req, res, next) => {
  // If it's an API route that wasn't caught above, return 404
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send("Unauthenticated!");
});

/* ------------------ SERVER ------------------ */
// ninth

app.listen(port, () => {
  connect();
  console.log(`Server running on ${port}`);
});
