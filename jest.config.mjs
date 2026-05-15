/** @type {import('jest').Config} */
export default {
  roots: ["<rootDir>/tests/unit"],
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "mjs"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "\\.(avif|webp|jpg|jpeg|png)$":
      "<rootDir>/tests/unit/__mocks__/fileMock.ts",
    "\\.svg$": "<rootDir>/tests/unit/__mocks__/svgMock.ts",
  },
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{ts,tsx}",
    "!<rootDir>/src/main.tsx",
    "!<rootDir>/src/vite-env.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
      },
    ],
    "^.+\\.mjs$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "ecmascript",
          },
        },
      },
    ],
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
