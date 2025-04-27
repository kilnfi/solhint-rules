const BaseChecker = require("solhint/lib/rules/base-checker");

const DEFAULT_HEADER = [`// SPDX-License-Identifier: MIT`];

const ruleId = "header";
const meta = {
  type: "header",

  docs: {
    description: `Check that source files start with the defined header`,
    category: "Style Guide Rules",
  },

  recommended: false,
  defaultSetup: ["error", DEFAULT_HEADER],

  schema: { type: "array" },
};

class OrderingChecker extends BaseChecker {
  constructor(reporter, config, inputSrc) {
    super(reporter, ruleId, meta);

    this.defaultHeader =
      (
        (config && config.getArray("kiln-rules/header", DEFAULT_HEADER)) ||
        DEFAULT_HEADER
      ).join("\n") + "\n";
    this.inputSrc = inputSrc;
  }

  SourceUnit(node) {
    const headerStart = 0;
    const headerEnd = this.inputSrc.indexOf("pragma solidity", this.inputSrc);

    if (headerEnd === -1) {
      this.reporter.error(
        node,
        this.ruleId,
        "Missing header in the source file",
        (fixer) => {
          return fixer.insertTextBefore(node, this.defaultHeader);
        }
      );
      return;
    }

    const currentHeader = this.inputSrc.slice(headerStart, headerEnd);
    if (currentHeader !== this.defaultHeader) {
      this.reporter.error(
        node,
        this.ruleId,
        "Invalid header in the source file",
        (fixer) => {
          return fixer.replaceTextRange(
            [headerStart, headerEnd - 1],
            this.defaultHeader
          );
        }
      );
    }
  }
}

module.exports = OrderingChecker;
