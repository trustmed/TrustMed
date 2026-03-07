import { defineConfig } from "orval";

const config_path = './config'

export default defineConfig({
  trustMedApi: {
    input: `${config_path}/swagger-config/swagger.json`,
    output: {
      mode: "tags-split",
      target: "./services/api",
      schemas: "./services/interfaces",
      client: "react-query",
      httpClient: "axios",
      override: {
        mutator: {
          path: `${config_path}/api-config/axios.ts`,
        },
      },
    },
  },
  // trustMedApiZod: {
  //   input: `${config_path}/swagger-config/swagger.json`,
  //   output: {
  //     mode: "tags-split",
  //     client: "zod",
  //     target: "./services/validations/endpoints",
  //     fileExtension: ".zod.ts",
  //   },
  // },
});
