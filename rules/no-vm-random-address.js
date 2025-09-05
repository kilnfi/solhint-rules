const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "no-vm-random-address";
const DEFAULT_SEVERITY = "error";
const meta = {
  type: "best-practices",

  docs: {
    description: "Disallow vm.randomAddress() usage",
    category: "Best Practice Rules",
    options: [
      {
        description: "off, warn or error",
        default: DEFAULT_SEVERITY,
      },
    ],
  },

  recommended: true,
  defaultSetup: [DEFAULT_SEVERITY],
  fixable: false,

  schema: {},
};

class NoVmRandomAddressChecker extends BaseChecker {
  constructor(reporter, config) {
    super(reporter, ruleId, meta);
  }

  MemberAccess(node) {
    if (this.isVmRandomAddress(node)) {
      this.error(node, "Avoid to use vm.randomAddress");
    }
  }

  isVmRandomAddress(node) {
    return (
      node.expression &&
      node.expression.name === "vm" &&
      node.memberName === "randomAddress"
    );
  }
}

module.exports = NoVmRandomAddressChecker;