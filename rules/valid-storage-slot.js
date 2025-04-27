const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "valid-storage-slot";
const meta = {
    type: "security",

    docs: {
        description: `Check if constant variables used as storage slots have the proper value`,
        category: "Security Rules",
    },

    recommended: false,
    defaultSetup: "warn",

    schema: null,
};

class ValidStorageSlotChecker extends BaseChecker {
    constructor(reporter) {
        super(reporter, ruleId, meta);
    }

    VariableDeclaration(node) {
        const children = node.children;
        console.log(node);
        console.log(children);
    }
}

module.exports = ValidStorageSlotChecker;
