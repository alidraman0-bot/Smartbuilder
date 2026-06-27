const { buildMVP } = require('../src/engine');

async function runTest() {
  console.log("==> Testing Smartbuilder MVP Engine Pipeline <==");
  try {
    const fakeIdea = "A simple task manager where users can list tasks and toggle them as completed.";
    const result = await buildMVP(fakeIdea);
    console.log("==> Test Complete <==");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Test Failed:", err);
  }
}

runTest();
