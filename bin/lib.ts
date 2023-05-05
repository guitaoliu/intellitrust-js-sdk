export interface GeneratorOptions {
  input: string;
  output: string;
  config: string;
}

export const getGeneratorOptions = (
  type: "admin" | "auth"
): GeneratorOptions => {
  let input: string = "";
  let output: string = "";
  let config: string = "";

  if (type === "admin") {
    input = "administration.json";
    output = "admin-sdk";
    config = "config-admin.json";
  }

  if (type === "auth") {
    input = "authentication.json";
    output = "auth-sdk";
    config = "config-auth.json";
  }

  return {
    input,
    output,
    config,
  };
};

export default getGeneratorOptions;
