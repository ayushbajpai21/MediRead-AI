import { createApp } from "./src/app.js";

async function runTests() {
  console.log("=== MediRead AI API & Gateway Tests ===");
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  let passed = 0;
  let failed = 0;

  try {
    // 1. Test Health Endpoint
    console.log("\n[Test 1] Health Endpoint: GET /api/health");
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    if (healthRes.status === 200 && healthJson.status === "ok") {
      console.log("✓ Health check passed:", healthJson);
      passed++;
    } else {
      console.error("✗ Health check failed:", healthRes.status, healthJson);
      failed++;
    }

    // 2. Test Analyze with No File
    console.log("\n[Test 2] Analyze Endpoint: POST with no file");
    const noFileRes = await fetch(`${baseUrl}/prescriptions/analyze`, {
      method: "POST"
    });
    const noFileJson = await noFileRes.json();
    if (noFileRes.status === 400 && noFileJson.success === false) {
      console.log("✓ Empty upload correctly rejected with 400:", noFileJson.error);
      passed++;
    } else {
      console.error("✗ Expected 400 rejection, got:", noFileRes.status, noFileJson);
      failed++;
    }

    // 3. Test Analyze with Malformed/Fake Image File
    console.log("\n[Test 3] Analyze Endpoint: POST with invalid image signature");
    const fakeData = new FormData();
    const fakeBlob = new Blob(["NOT AN IMAGE FILE JUST TEXT"], { type: "image/jpeg" });
    fakeData.append("prescription", fakeBlob, "fake.jpg");

    const fakeRes = await fetch(`${baseUrl}/prescriptions/analyze`, {
      method: "POST",
      body: fakeData
    });
    const fakeJson = await fakeRes.json();
    if (fakeRes.status === 400 && fakeJson.error?.includes("signature")) {
      console.log("✓ Fake binary signature correctly caught:", fakeJson.error);
      passed++;
    } else {
      console.error("✗ Binary signature check failed:", fakeRes.status, fakeJson);
      failed++;
    }

    console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  } catch (err) {
    console.error("Test execution exception:", err);
  } finally {
    server.close();
  }
}

runTests();
