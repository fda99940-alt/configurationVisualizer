const test = require("node:test");
const assert = require("node:assert/strict");
const schema = require("./fixtures/simple-schema.json");
const core = require("../app.js");

test("generates expected JSON for supported schema types", () => {
  const rawValues = {
    "$.name": "local-app",
    "$.port": "8080",
    "$.enabled": "true",
    "$.mode": "prod",
    "$.threshold": "0.75",
    "$.settings.region": "us-east-1",
    "$.settings.retries": "3"
  };

  core.validateRootSchema(schema);
  const generated = core.generateObjectFromRawValues(schema, "$", rawValues);

  assert.deepEqual(generated, {
    name: "local-app",
    port: 8080,
    enabled: true,
    mode: "prod",
    threshold: 0.75,
    settings: {
      region: "us-east-1",
      retries: 3
    }
  });

  const jsonText = JSON.stringify(generated, null, 2);
  assert.equal(
    jsonText,
    [
      "{",
      "  \"name\": \"local-app\",",
      "  \"port\": 8080,",
      "  \"enabled\": true,",
      "  \"mode\": \"prod\",",
      "  \"threshold\": 0.75,",
      "  \"settings\": {",
      "    \"region\": \"us-east-1\",",
      "    \"retries\": 3",
      "  }",
      "}"
    ].join("\n")
  );
});

test("throws when a required field is missing", () => {
  const rawValues = {
    "$.name": "local-app",
    "$.port": "8080",
    "$.enabled": "true",
    "$.mode": "",
    "$.threshold": "0.75",
    "$.settings.region": "us-east-1",
    "$.settings.retries": "3"
  };

  assert.throws(
    () => core.generateObjectFromRawValues(schema, "$", rawValues),
    /Required field is missing: \$\.mode/
  );
});

test("throws when enum value is invalid", () => {
  const rawValues = {
    "$.name": "local-app",
    "$.port": "8080",
    "$.enabled": "true",
    "$.mode": "staging",
    "$.threshold": "0.75",
    "$.settings.region": "us-east-1",
    "$.settings.retries": "3"
  };

  assert.throws(
    () => core.generateObjectFromRawValues(schema, "$", rawValues),
    /Invalid enum value for \$\.mode\./
  );
});
