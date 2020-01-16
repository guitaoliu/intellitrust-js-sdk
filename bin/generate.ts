#!/usr/bin/env node

import * as execa from "execa";
import * as fs from "fs";
import * as path from "path";
import * as mustache from "mustache";
import getGeneratorOptions from "./lib";

const GENERATOR = "typescript-axios";
const TEMPLATES = "templates";
const AUTH = "auth";
const ADMIN = "admin";
const README = "README.md";
const README_TEMPLATE = "README-custom.mustache";
const ADMIN_EXAMPLE = "admin-example.ts";
const AUTH_EXAMPLE = "auth-example.ts";

const generateReadme = (config: string, output: string, type: string) => {
  const isAdmin = type === "admin";

  const template = fs.readFileSync(path.join(TEMPLATES, README_TEMPLATE), {
    encoding: "UTF-8"
  });

  const options = fs.readFileSync(config, { encoding: "UTF-8" });

  const { npmName, npmVersion } = JSON.parse(options);

  const example = fs.readFileSync(
    path.join(TEMPLATES, isAdmin ? ADMIN_EXAMPLE : AUTH_EXAMPLE)
  );

  const sdkType = isAdmin ? "Administration" : "Authentication";

  const sdkVar = isAdmin ? "AdminSDK" : "AuthSDK";

  const readme = mustache.render(template, {
    npmName,
    npmVersion,
    example,
    sdkType,
    sdkVar,
    sdkTypeLower: sdkType.toLowerCase()
  });

  fs.writeFileSync(path.join(output, README), readme, { encoding: "UTF-8" });
};

/**
 * Main function.
 */
(async () => {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.error(
      "Too many arguments provided. Expected 1, received",
      args.length
    );
    process.exit(1);
  }

  const sdkType = args.pop();

  if (sdkType !== "auth" && sdkType !== "admin") {
    console.error(
      `Invalid type provided. Exected '${ADMIN}' or '${AUTH}', received`,
      sdkType
    );
    process.exit(1);
  }

  const { input, output, config } = getGeneratorOptions(sdkType);

  console.log(`Generating ${sdkType} SDK...`);

  const subprocess = execa(
    "npx",
    [
      "openapi-generator",
      "generate",
      "-i",
      input,
      "-g",
      GENERATOR,
      "-t",
      TEMPLATES,
      "-o",
      output,
      "-c",
      config
    ],
    {
      shell: true
    }
  );

  subprocess.stdout.pipe(process.stdout);

  await subprocess;

  console.log("Post processing files...");

  generateReadme(config, output, sdkType);

  console.log("Generated README");
})();
