const BaseChecker = require("solhint/lib/rules/base-checker");
const { severityDescription } = require("../../doc/utils");

const ruleId = "compiler-version";
const DEFAULT_SEVERITY = "error";
const DEFAULT_SEMVER = ">=0.8.26";
const meta = {
  type: "security",

  docs: {
    description: `Compiler version must satisfy a exact requirement.`,
    category: "Security Rules",
    options: [
      {
        description: severityDescription,
        default: DEFAULT_SEVERITY,
      },
      {
        description: `Exact requirement`,
        default: DEFAULT_SEMVER,
      },
    ],
  },

  recommended: true,
  defaultSetup: [DEFAULT_SEVERITY, DEFAULT_SEMVER],

  schema: {
    type: "string",
  },
};

class CompilerVersionChecker extends BaseChecker {
  constructor(reporter, config) {
    super(reporter, ruleId, meta);

    this.requirement =
      (config && config.getStringFromArray(ruleId, DEFAULT_SEMVER)) ||
      DEFAULT_SEMVER;
  }

  SourceUnit(node) {
    const hasPragmaDirectiveDef = node.children.some(
      (curItem) => curItem.type === "PragmaDirective"
    );

    if (!hasPragmaDirectiveDef) {
      this.warn(node, "Compiler version must be declared ");
    }
  }

  PragmaDirective(node) {
    if (node.name === "solidity" && node.value !== this.requirement) {
      this.warn(
        node,
        `Compiler version ${node.value} does not satisfy the ${this.requirement} exact requirement`
      );
    }
  }
}

module.exports = CompilerVersionChecker;
