// Config file for npm package "standard-version"
// >Any of the command line parameters accepted by standard-version can instead be provided via configuration.
// https://github.com/conventional-changelog/standard-version#configuration

// At this time there is no possibility to include <commit body. while generation CHANGELOG:
// https://github.com/conventional-changelog/standard-version/issues/242

module.exports = {
  header: "# Changelog for app Wesnoth duel replay parser\n", // def: Changelog
  scripts: {
    // https://github.com/conventional-changelog/standard-version/issues/317#issuecomment-823944371
    // "bash" added for correct run from Windows PowerShell
    postchangelog: "bash ./tools/for_standard-version.sh",
  },
  // https://github.com/conventional-changelog/standard-version#can-i-use-standard-version-for-additional-metadata-files-languages-or-version-files
  bumpFiles: [
    {
      filename: "./frontend_static_files/version.txt",
      // The `plain-text` updater assumes the file contents represents the version.
      type: "plain-text",
    },
    {
      filename: "package-lock.json",
      // The `json` updater assumes the version is available under a `version` key in the provided JSON document.
      type: "json",
    },
    {
      filename: "package.json",
      // The `json` updater assumes the version is available under a `version` key in the provided JSON document.
      type: "json",
    },
  ],
  types: [
    {
      type: "chore",
      section: "Others",
      hidden: false,
    },
    {
      type: "feat",
      section: "Features",
      hidden: false,
    },
    {
      type: "fix",
      section: "Bug Fixes",
      hidden: false,
    },
    {
      type: "docs",
      section: "Docs",
      hidden: false,
    },
    {
      type: "style",
      section: "Styling",
      hidden: false,
    },
    {
      type: "refactor",
      section: "Code Refactoring",
      hidden: false,
    },
    {
      type: "perf",
      section: "Performance Improvements",
      hidden: false,
    },
    {
      type: "test",
      section: "Tests",
      hidden: false,
    },
    {
      type: "build",
      section: "Build System",
      hidden: false,
    },
    {
      type: "ci",
      section: "CI",
      hidden: false,
    },
  ],
};
