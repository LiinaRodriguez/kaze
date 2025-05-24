// Cambiar a CommonJS (Jest funciona mejor con esto)
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Mapeo para imports sin extensión
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json', // Asegurar que usa tu tsconfig
      }
    ]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: [
    '<rootDir>/test/**/*.test.ts',  // Ruta corregida para tests en raíz/test
    '<rootDir>/src/**/*.test.ts'    // Búsqueda en carpetas src
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(chalk)/)', // Transformar módulos ESM no compatibles
  ],
};