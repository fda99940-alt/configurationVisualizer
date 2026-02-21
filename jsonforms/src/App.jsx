import { useMemo, useState } from "react";
import { JsonForms } from "@jsonforms/react";
import { vanillaCells, vanillaRenderers } from "@jsonforms/vanilla-renderers";
import { Generate, createAjv } from "@jsonforms/core";
import defaultSchema from "./defaultSchema.json";

const ajv = createAjv({ allErrors: true, verbose: true });

export default function App() {
  const [schema, setSchema] = useState(defaultSchema);
  const [data, setData] = useState({});
  const [errors, setErrors] = useState([]);
  const [status, setStatus] = useState("Loaded built-in sample schema.");
  const [schemaName, setSchemaName] = useState("defaultSchema.json");
  const [configName, setConfigName] = useState("None");

  const uischema = useMemo(() => Generate.uiSchema(schema), [schema]);
  const jsonOutput = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const invalidSections = useMemo(() => {
    const sections = new Set();
    errors.forEach((err) => {
      const path = typeof err.instancePath === "string" ? err.instancePath : "";
      const trimmed = path.replace(/^\/+/, "");
      if (!trimmed) {
        sections.add("root");
        return;
      }

      const [topLevel] = trimmed.split("/");
      sections.add(topLevel || "root");
    });
    return Array.from(sections).sort((a, b) => a.localeCompare(b));
  }, [errors]);

  const handleSchemaFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      validateRootSchema(parsed);
      setSchema(parsed);
      setData({});
      setErrors([]);
      setSchemaName(file.name);
      setConfigName("None");
      setStatus(`Loaded schema: ${file.name}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to parse schema.");
    }
  };

  const handleConfigFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      validateConfigData(parsed);

      const isValid = ajv.validate(schema, parsed);
      const nextErrors = cloneAjvErrors(ajv.errors);

      setData(parsed);
      setErrors(nextErrors);
      setConfigName(file.name);
      setStatus(
        isValid
          ? `Loaded configuration: ${file.name}`
          : `Loaded configuration with ${nextErrors.length} validation issue(s): ${file.name}`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to parse configuration.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "configuration.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <header className="header">
        <h1>JSON Forms Prototype</h1>
        <p>Schema-driven UI using JSON Forms as the rendering engine.</p>
      </header>

      <main className="layout">
        <section className="panel controls">
          <h2>Schema & Data</h2>
          <h3>Load Schema</h3>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleSchemaFile}
          />
          <p className="meta">Current schema: {schemaName}</p>
          <h3>Import Existing Configuration</h3>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleConfigFile}
          />
          <p className="meta">Current config: {configName}</p>
          <p className="meta">{status}</p>
        </section>

        <section className={`panel form-panel ${errors.length > 0 ? "has-errors" : ""}`}>
          <h2>Configuration Form</h2>
          {errors.length > 0 ? (
            <div className="validation-banner" role="status">
              <strong>{errors.length}</strong> validation issue(s). Invalid section(s):{" "}
              {invalidSections.join(", ")}
            </div>
          ) : null}
          <JsonForms
            schema={schema}
            uischema={uischema}
            data={data}
            renderers={vanillaRenderers}
            cells={vanillaCells}
            ajv={ajv}
            onChange={({ data: nextData, errors: nextErrors }) => {
              setData(nextData);
              setErrors(nextErrors ?? []);
            }}
          />
        </section>

        <section className="panel output-panel">
          <h2>Generated JSON</h2>
          <button type="button" onClick={handleDownload}>
            Download JSON
          </button>
          <pre>{jsonOutput}</pre>
          <h3>Validation</h3>
          {errors.length === 0 ? (
            <p className="ok">No validation errors.</p>
          ) : (
            <ul className="error-list">
              {errors.map((err, index) => (
                <li key={`${err.instancePath}-${err.keyword}-${index}`}>
                  <code>{err.instancePath || "/"}</code>: {err.message}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function validateRootSchema(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Schema must be a JSON object.");
  }

  if (candidate.type !== "object") {
    throw new Error('Root schema must have type "object".');
  }

  if (!candidate.properties || typeof candidate.properties !== "object") {
    throw new Error("Root schema must include a properties object.");
  }
}

function validateConfigData(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Configuration file must be a JSON object.");
  }
}

function cloneAjvErrors(source) {
  return Array.isArray(source) ? source.map((entry) => ({ ...entry })) : [];
}
