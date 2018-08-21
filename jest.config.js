module.exports = {
  setupTestFrameworkScriptFile: '<rootDir>/shared/setup-test-env.js',
  moduleNameMapper: {
    '.*(css|less|scss|jpg|jpeg|gif|png)$': '<rootDir>/shared/mock-assets.js'
  }
};
