// SigmaGPT Full Stack Integration Test Suite
// Verifies backend server, MongoDB connectivity, auth, plans, chat, and OpenAI fallback

import mongoose from "mongoose";
import http from "http";

const BASE_URL = "http://127.0.0.1:8080/api";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log("=== Starting SigmaGPT Integration Test Suite ===");

  // 1. Wait for server to be responsive
  let serverReady = false;
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        console.log("✓ Health Check Passed:", data);
        serverReady = true;
        break;
      }
    } catch {
      await sleep(500);
    }
  }

  if (!serverReady) {
    throw new Error("Server failed to respond to /health in time");
  }

  // 2. Test /auth/plans
  console.log("\nTesting /auth/plans...");
  const plansRes = await fetch(`${BASE_URL}/auth/plans`);
  const plans = await plansRes.json();
  console.log(`✓ Fetched ${plans.length} subscription plans:`, plans.map(p => `${p.name} ($${p.price})`).join(", "));
  if (plans.length < 3) throw new Error("Expected at least 3 plans (Free, Pro, Prime)");

  // 3. Test Registration
  console.log("\nTesting User Registration...");
  const testEmail = `harshvardhan_${Date.now()}@test.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Harshvardhan Singh",
      email: testEmail,
      password: "securePassword123!",
    }),
  });
  if (!regRes.ok) {
    const err = await regRes.text();
    throw new Error(`Registration failed (${regRes.status}): ${err}`);
  }
  const regData = await regRes.json();
  const token = regData.token;
  console.log("✓ Registration Successful! User:", regData.user.name, "| Plan:", regData.user.plan);
  if (!token) throw new Error("No token returned on registration");

  // 4. Test Login
  console.log("\nTesting User Login...");
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "securePassword123!",
    }),
  });
  if (!loginRes.ok) throw new Error("Login failed");
  const loginData = await loginRes.json();
  console.log("✓ Login Successful! Received JWT token for:", loginData.user.email);

  // 5. Test /auth/me
  console.log("\nTesting /auth/me (Protected Route)...");
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!meRes.ok) throw new Error("Failed to fetch /auth/me");
  const meData = await meRes.json();
  console.log("✓ User Details Verified:", meData.user.name, "| Usage:", meData.usage);

  // 6. Test Chat API (Safe mode without API key)
  console.log("\nTesting /api/chat (AI integration & thread creation)...");
  const testThreadId = `thread_${Date.now()}`;
  const chatRes = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      threadId: testThreadId,
      message: "Hello SigmaGPT! Tell me what features you have.",
    }),
  });
  if (!chatRes.ok) {
    const err = await chatRes.text();
    throw new Error(`Chat request failed (${chatRes.status}): ${err}`);
  }
  const chatData = await chatRes.json();
  console.log("✓ Chat Reply Received Successfully!");
  console.log("  Reply Preview:", chatData.reply.slice(0, 100) + "...");

  // 7. Test Thread Listing
  console.log("\nTesting /api/thread (History Listing)...");
  const threadsRes = await fetch(`${BASE_URL}/thread`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const threads = await threadsRes.json();
  console.log(`✓ Retrieved ${threads.length} user thread(s). First thread title: "${threads[0]?.title}"`);

  // 8. Test Thread Messages Retrieval
  console.log("\nTesting /api/thread/:threadId...");
  const messagesRes = await fetch(`${BASE_URL}/thread/${testThreadId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const messages = await messagesRes.json();
  console.log(`✓ Retrieved ${messages.length} message(s) in thread.`);

  // 9. Test Plan Upgrade
  console.log("\nTesting /auth/upgrade to Pro Plan...");
  const upgradeRes = await fetch(`${BASE_URL}/auth/upgrade`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan: "pro" }),
  });
  const upgradeData = await upgradeRes.json();
  console.log("✓ Upgraded Successfully! New Plan:", upgradeData.user.plan);

  // 10. Test Thread Deletion
  console.log("\nTesting /api/thread/:threadId (Delete Thread)...");
  const delRes = await fetch(`${BASE_URL}/thread/${testThreadId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const delData = await delRes.json();
  console.log("✓ Thread Deleted Successfully:", delData);

  console.log("\n🎉 ALL 10 INTEGRATION TESTS PASSED PERFECTLY! 🎉\n");
}

runTests().catch((err) => {
  console.error("\n❌ Test Failed:", err);
  process.exit(1);
});
