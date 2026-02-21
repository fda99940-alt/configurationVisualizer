const SchemaBuilderCore = (function createSchemaBuilderCore() {
  function validateRootSchema(schema) {
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
      throw new Error("Schema must be a JSON object.");
    }

    if (schema.type !== "object") {
      throw new Error('Root schema must have type "object".');
    }

    if (!schema.properties || typeof schema.properties !== "object") {
      throw new Error("Root schema must contain a properties object.");
    }
  }

  function generateObjectFromRawValues(schema, path, rawValues) {
    const output = {};
    const requiredList = Array.isArray(schema.required) ? schema.required : [];
    const properties = schema.properties || {};

    Object.entries(properties).forEach(([propName, propSchema]) => {
      const propPath = `${path}.${propName}`;

      if (propSchema && propSchema.type === "object") {
        const nested = generateObjectFromRawValues(propSchema, propPath, rawValues);
        if (Object.keys(nested).length > 0 || requiredList.includes(propName)) {
          output[propName] = nested;
        }
        return;
      }

      const rawValue = Object.prototype.hasOwnProperty.call(rawValues, propPath)
        ? rawValues[propPath]
        : "";
      const isRequired = requiredList.includes(propName);
      const parsed = parseValue(propSchema, rawValue, propPath, isRequired);

      if (parsed !== undefined) {
        output[propName] = parsed;
      }
    });

    return output;
  }

  function parseValue(schema, rawValue, path, isRequired) {
    if (rawValue === "") {
      if (isRequired) {
        throw new Error(`Required field is missing: ${path}`);
      }
      return undefined;
    }

    const type = schema && typeof schema === "object" ? schema.type : "string";

    if (schema && Array.isArray(schema.enum)) {
      if (!schema.enum.map(String).includes(rawValue)) {
        throw new Error(`Invalid enum value for ${path}.`);
      }
      return inferEnumValue(schema.enum, rawValue);
    }

    if (type === "integer") {
      const numeric = Number(rawValue);
      if (!Number.isInteger(numeric)) {
        throw new Error(`Expected integer at ${path}.`);
      }
      return numeric;
    }

    if (type === "number") {
      const numeric = Number(rawValue);
      if (Number.isNaN(numeric)) {
        throw new Error(`Expected number at ${path}.`);
      }
      return numeric;
    }

    if (type === "boolean") {
      if (rawValue !== "true" && rawValue !== "false") {
        throw new Error(`Expected boolean at ${path}.`);
      }
      return rawValue === "true";
    }

    return rawValue;
  }

  function inferEnumValue(enumOptions, rawValue) {
    const match = enumOptions.find((opt) => String(opt) === rawValue);
    return match === undefined ? rawValue : match;
  }

  return {
    validateRootSchema,
    generateObjectFromRawValues,
    parseValue,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SchemaBuilderCore;
}

if (typeof window !== "undefined") {
  window.SchemaBuilderCore = SchemaBuilderCore;
}

(function initSchemaBuilderApp(core) {
  if (typeof document === "undefined") {
    return;
  }

  const fileInput = document.getElementById("schema-file-input");
  const loadSchemaBtn = document.getElementById("load-schema-btn");
  const schemaMeta = document.getElementById("schema-meta");
  const dynamicForm = document.getElementById("dynamic-form");
  const generateBtn = document.getElementById("generate-json-btn");
  const downloadBtn = document.getElementById("download-json-btn");
  const errorText = document.getElementById("error-text");
  const outputJson = document.getElementById("output-json");

  if (
    !fileInput ||
    !loadSchemaBtn ||
    !schemaMeta ||
    !dynamicForm ||
    !generateBtn ||
    !downloadBtn ||
    !errorText ||
    !outputJson
  ) {
    return;
  }

  let activeSchema = null;
  let latestJsonText = "";

  loadSchemaBtn.addEventListener("click", async () => {
    clearError();
    resetOutput();

    const selectedFile = fileInput.files && fileInput.files[0];
    if (!selectedFile) {
      setError("Select a JSON Schema file first.");
      return;
    }

    try {
      const fileText = await selectedFile.text();
      const parsed = JSON.parse(fileText);
      core.validateRootSchema(parsed);
      activeSchema = parsed;
      renderFormForSchema(parsed);
      const title = parsed.title || selectedFile.name;
      const fieldCount = parsed.properties ? Object.keys(parsed.properties).length : 0;
      schemaMeta.textContent = `Loaded: ${title} (${fieldCount} top-level fields)`;
    } catch (err) {
      activeSchema = null;
      dynamicForm.innerHTML = "";
      setError(err instanceof Error ? err.message : "Failed to load schema.");
      schemaMeta.textContent = "No schema loaded.";
    }
  });

  generateBtn.addEventListener("click", () => {
    clearError();

    if (!activeSchema) {
      setError("Load a schema before generating JSON.");
      return;
    }

    try {
      const rawValues = collectRawValuesFromDom(activeSchema, "$", dynamicForm);
      const generated = core.generateObjectFromRawValues(activeSchema, "$", rawValues);
      latestJsonText = JSON.stringify(generated, null, 2);
      outputJson.textContent = latestJsonText;
      downloadBtn.disabled = false;
    } catch (err) {
      resetOutput();
      setError(err instanceof Error ? err.message : "Failed to generate JSON.");
    }
  });

  downloadBtn.addEventListener("click", () => {
    if (!latestJsonText) {
      return;
    }

    const blob = new Blob([latestJsonText], { type: "application/json" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "configuration.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  });

  function renderFormForSchema(schema) {
    dynamicForm.innerHTML = "";
    const fragment = buildObjectFields(schema, "$", "");
    dynamicForm.appendChild(fragment);
  }

  function buildObjectFields(schema, path, namePrefix) {
    const wrapper = document.createElement("div");
    wrapper.className = "group";

    const title = document.createElement("h3");
    title.className = "group-title";
    title.textContent = schema.title || pathLabel(path);
    wrapper.appendChild(title);

    const requiredList = Array.isArray(schema.required) ? schema.required : [];
    const properties = schema.properties || {};

    Object.entries(properties).forEach(([propName, propSchema]) => {
      const propPath = `${path}.${propName}`;
      const fullName = namePrefix ? `${namePrefix}.${propName}` : propName;
      const isRequired = requiredList.includes(propName);

      if (propSchema && propSchema.type === "object") {
        const nested = buildObjectFields(propSchema, propPath, fullName);
        wrapper.appendChild(nested);
        return;
      }

      const field = document.createElement("div");
      field.className = "field";

      const label = document.createElement("label");
      label.htmlFor = fullName;
      label.textContent = `${propName}${isRequired ? " *" : ""}`;
      field.appendChild(label);

      const input = createInputForSchema(propSchema, fullName);
      input.dataset.schemaPath = propPath;
      field.appendChild(input);

      const hint = document.createElement("small");
      hint.className = "hint";
      hint.textContent = fieldHint(propSchema, isRequired);
      field.appendChild(hint);

      wrapper.appendChild(field);
    });

    return wrapper;
  }

  function createInputForSchema(schema, name) {
    const type = schema && typeof schema === "object" ? schema.type : "string";

    if (schema && Array.isArray(schema.enum)) {
      const select = document.createElement("select");
      select.id = name;
      select.name = name;

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "-- Select --";
      select.appendChild(placeholder);

      schema.enum.forEach((value) => {
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = String(value);
        select.appendChild(option);
      });

      return select;
    }

    if (type === "boolean") {
      const select = document.createElement("select");
      select.id = name;
      select.name = name;
      ["", "true", "false"].forEach((entry) => {
        const option = document.createElement("option");
        option.value = entry;
        option.textContent = entry === "" ? "-- Select --" : entry;
        select.appendChild(option);
      });
      return select;
    }

    const input = document.createElement("input");
    input.id = name;
    input.name = name;

    if (type === "number" || type === "integer") {
      input.type = "number";
      input.step = type === "integer" ? "1" : "any";
    } else {
      input.type = "text";
    }

    return input;
  }

  function collectRawValuesFromDom(schema, path, rootNode) {
    const rawValues = {};

    function walkObject(currentSchema, currentPath) {
      const properties = currentSchema.properties || {};

      Object.entries(properties).forEach(([propName, propSchema]) => {
        const propPath = `${currentPath}.${propName}`;

        if (propSchema && propSchema.type === "object") {
          walkObject(propSchema, propPath);
          return;
        }

        const input = rootNode.querySelector(`[data-schema-path="${propPath}"]`);
        if (!input) {
          throw new Error(`Missing input for ${propPath}.`);
        }

        rawValues[propPath] = input.value;
      });
    }

    walkObject(schema, path);
    return rawValues;
  }

  function fieldHint(schema, required) {
    const type = schema && typeof schema === "object" ? schema.type || "string" : "string";
    const requiredHint = required ? "Required" : "Optional";

    if (schema && Array.isArray(schema.enum)) {
      return `${requiredHint} | enum: ${schema.enum.join(", ")}`;
    }

    return `${requiredHint} | type: ${type}`;
  }

  function pathLabel(path) {
    if (path === "$") {
      return "Root";
    }
    const segments = path.split(".").filter(Boolean);
    return segments[segments.length - 1] || "Object";
  }

  function setError(message) {
    errorText.textContent = message;
  }

  function clearError() {
    errorText.textContent = "";
  }

  function resetOutput() {
    latestJsonText = "";
    outputJson.textContent = "";
    downloadBtn.disabled = true;
  }
})(SchemaBuilderCore);
