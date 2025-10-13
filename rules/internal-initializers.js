class InternalInitializers {
  constructor(reporter, config) {
    this.ruleId = "internal-initializers";
    this.reporter = reporter;
    this.config = config;
  }

  ContractDefinition(ctx) {
    const { subNodes } = ctx;
    for (let subNode of subNodes) {
      const { type, visibility, modifiers, name } = subNode;

      if (type === "FunctionDefinition" && this.hasOnlyInitializingModifier(modifiers)) {
        if (visibility !== "internal" && visibility !== "private") {
          this.reporter.error(
            subNode,
            this.ruleId,
            `Function ${name} has onlyInitializing modifier but visibility is ${visibility}. It should be internal or private.`
          );
        }
      }
    }
  }

  hasOnlyInitializingModifier(modifiers) {
    if (!modifiers) {
      return false;
    }
    return modifiers.some((modifier) => modifier.name === "onlyInitializing");
  }
}

module.exports = InternalInitializers;
