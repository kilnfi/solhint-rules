const BaseChecker = require("solhint/lib/rules/base-checker");
const ethers = require("ethers");

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
  constructor(reporter, _, inputSrc) {
    super(reporter, ruleId, meta);
    this.inputSrc = inputSrc;
  }

  VariableDeclaration(node) {
    if (node.isDeclaredConst && node.name.endsWith("_STORAGE_LOCATION")) {
      if (node.typeName.name !== "bytes32") {
        this.reporter.error(
          node,
          this.ruleId,
          "Constant storage location must be bytes32"
        );
      }
      if (node.expression.type !== "NumberLiteral") {
        this.reporter.error(
          node,
          this.ruleId,
          "Constant storage location must be a number literal"
        );
      }
      if (node.loc.start.line === 0) {
        this.reporter.error(
          node,
          this.ruleId,
          "Missing @custom:slot before slot declaration"
        );
        return;
      }
      const previousLine = this.getLine(node.loc.start.line - 1);
      const slotId = previousLine.match(
        /\/\/\/\s*@custom:slot\s+([^\s]+)/
      )?.[1];
      if (slotId === undefined) {
        this.reporter.error(
          node,
          this.ruleId,
          "Missing @custom:slot before slot declaration"
        );
        return;
      }

      const hash = ethers.keccak256(new TextEncoder().encode(slotId));
      const parsedHash = BigInt(hash);
      const secondHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256"],
          [parsedHash - BigInt(1)]
        )
      );
      const parsedSecondHash = BigInt(secondHash);
      const expectedSlot = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [
          parsedSecondHash &
            BigInt(
              "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00"
            ),
        ]
      );

      if (BigInt(expectedSlot) !== BigInt(node.expression.number)) {
        this.reporter.error(
          node,
          this.ruleId,
          `Constant storage location for id ${slotId} must be ${expectedSlot} (line ${node.loc.start.line})`
        );
      }
    }
  }

  getLine(lineNb) {
    return this.inputSrc.split("\n")[lineNb - 1];
  }

  report(node, nodeAfter, label, labelAfter) {
    const message = `Function order is incorrect, ${label} can not go before ${labelAfter} (line ${nodeAfter.loc.start.line})`;
    this.reporter.error(node, this.ruleId, message);
  }
}

module.exports = ValidStorageSlotChecker;
