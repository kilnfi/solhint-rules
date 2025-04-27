const BaseChecker = require("solhint/lib/rules/base-checker");
const {
  isFallbackFunction,
  isReceiveFunction,
} = require("solhint/lib/common/ast-types");

const ruleId = "ordering";
const meta = {
  type: "order",

  docs: {
    description: `Check order of elements in file and inside each contract, according to the style guide. Errors are applied on each elements that is too high in the file.`,
    category: "Style Guide Rules",
    examples: {
      good: require("solhint/test/fixtures/order/ordering-correct"),
      bad: require("solhint/test/fixtures/order/ordering-incorrect"),
    },
  },

  recommended: false,
  defaultSetup: "warn",

  schema: null,
};

class OrderingChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta);
  }

  SourceUnit(node) {
    const children = node.children;
    this.checkOrder(children, sourceUnitPartOrder);
  }

  ContractDefinition(node) {
    const children = node.subNodes;

    this.checkOrder(children, contractPartOrder);
  }

  checkOrder(children, orderFunction) {
    if (children.length === 0) {
      return;
    }

    const childrenValues = [];
    for (let i = 0; i < children.length; i++) {
      const [comparisonValue, label] = orderFunction(children[i]);
      childrenValues.push({ value: comparisonValue, label: label });
    }

    for (let i = 0; i < childrenValues.length - 1; i++) {
      const currentValue = childrenValues[i];
      for (let y = i + 1; y < childrenValues.length; y++) {
        if (currentValue.value > childrenValues[y].value) {
          this.report(
            children[i],
            children[y],
            currentValue.label,
            childrenValues[y].label
          );
          break;
        }
      }
    }
  }

  report(node, nodeAfter, label, labelAfter) {
    const message = `Function order is incorrect, ${label} can not go before ${labelAfter} (line ${nodeAfter.loc.start.line})`;
    this.reporter.error(node, this.ruleId, message);
  }
}

function getMutabilityWeight({ baseWeight, stateMutability }) {
  switch (stateMutability) {
    case "constant":
    case "view":
      return baseWeight + 2;
    case "pure":
      return baseWeight + 4;
    default:
      return baseWeight;
  }
}

function sourceUnitPartOrder(node) {
  if (node.type === "PragmaDirective") {
    return [0, "pragma directive"];
  }

  if (node.type === "ImportDirective") {
    return [10, "import directive"];
  }

  if (node.type === "FileLevelConstant") {
    return [20, "file level constant"];
  }

  if (node.type === "EnumDefinition") {
    return [30, "enum definition"];
  }

  if (node.type === "StructDefinition") {
    return [35, "struct definition"];
  }

  if (node.type === "CustomErrorDefinition") {
    return [40, "custom error definition"];
  }

  if (node.type === "FunctionDefinition") {
    return [50, "free function definition"];
  }

  if (node.type === "ContractDefinition") {
    if (node.kind === "interface") {
      return [60, "interface"];
    }

    if (node.kind === "library") {
      return [70, "library definition"];
    }

    if (node.kind === "contract") {
      return [80, "contract definition"];
    }
  }

  throw new Error("Unrecognized source unit part, please report this issue");
}

function contractPartOrder(node) {
  if (node.type === "UsingForDeclaration") {
    return [0, "using for declaration"];
  }

  if (node.type === "EnumDefinition") {
    return [10, "enum definition"];
  }

  if (node.type === "StructDefinition") {
    return [15, "struct definition"];
  }

  if (node.type === "StateVariableDeclaration") {
    // the grammar: https://docs.soliditylang.org/en/latest/grammar.html
    // forbids declaration of multiple state variables in the same
    // StateVariableDeclaration, however in the AST they show up in an array,
    // similar to regular VariableDeclarationStatements, which allow
    // VariableDefinitionTuples inside them and therefore can declare many
    // variables at once
    if (node.variables.length !== 1) {
      throw new Error(
        "state variable definition with more than one variable. Please report this issue"
      );
    }
    const variable = node.variables[0];
    if (variable.isDeclaredConst) {
      return [20, "contract constant declaration"];
    } else if (variable.isImmutable) {
      return [22, "contract immutable declaration"];
    } else {
      return [25, "state variable declaration"];
    }
  }

  if (node.type === "EventDefinition") {
    return [30, "event definition"];
  }

  if (node.type === "CustomErrorDefinition") {
    return [35, "custom error definition"];
  }

  if (node.type === "ModifierDefinition") {
    return [40, "modifier definition"];
  }

  if (
    node.isConstructor ||
    (node.type === "FunctionDefinition" &&
      (isInitializerModifier(node.modifiers, "initializer", null) ||
        isInitializerModifier(node.modifiers, "onlyInitializing", null)))
  ) {
    return [50, "constructor/initializer"];
  }

  if (isReceiveFunction(node)) {
    return [60, "receive function"];
  }

  if (isFallbackFunction(node)) {
    return [70, "fallback function"];
  }

  if (node.type === "FunctionDefinition") {
    const { stateMutability, visibility } = node;

    if (
      (visibility === "internal" || visibility === "private") &&
      /^_get[A-Za-z0-9]+Storage$/.test(node.name)
    ) {
      return [22, "storage pointer getter"];
    }

    if (visibility === "external") {
      const weight = getMutabilityWeight({ baseWeight: 80, stateMutability });
      const label = [visibility, stateMutability, "function"].join(" ");

      return [weight, label];
    }

    if (visibility === "public") {
      const weight = getMutabilityWeight({ baseWeight: 90, stateMutability });
      const label = [visibility, stateMutability, "function"].join(" ");

      return [weight, label];
    }

    if (visibility === "internal") {
      const weight = getMutabilityWeight({ baseWeight: 100, stateMutability });
      const label = [visibility, stateMutability, "function"].join(" ");
      return [weight, label];
    }

    if (visibility === "private") {
      const weight = getMutabilityWeight({ baseWeight: 110, stateMutability });
      const label = [visibility, stateMutability, "function"].join(" ");
      return [weight, label];
    }

    throw new Error("Unknown order for function, please report this issue");
  }

  throw new Error("Unrecognized contract part, please report this issue");
}

function isInitializerModifier(modifiers, targetName, targetArguments) {
  // search the modifiers array with the name === 'initializer'
  return modifiers.some(
    (modifier) =>
      modifier.name === targetName && modifier.arguments === targetArguments
  );
}

module.exports = OrderingChecker;
