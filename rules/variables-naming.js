const BaseChecker = require("solhint/lib/rules/base-checker");

const ruleId = "variables-naming";
const meta = {
    type: "variables-naming",

    docs: {
        description: `Checks that variables declared in function bodies respect the naming convention`,
        category: "Style Guide Rules",
    },

    recommended: false,
    defaultSetup: "warn",

    schema: null,
};

class VariablesNamingChecker extends BaseChecker {
    constructor(reporter) {
        super(reporter, ruleId, meta);
    }

    StructDefinition(node) {
        for (const member of node.members) {
            if (member.name.startsWith("_") || member.name.startsWith("$")) {
                this.reporter.error(
                    member,
                    this.ruleId,
                    `Struct member ${member.name
                    } should not start with an underscore or a dollar sign (${member.name.slice(
                        1
                    )})`
                );
            }
        }
    }

    StateVariableDeclaration(node) {
        for (const variable of node.variables) {
            if (!variable.isDeclaredConst && !variable.isImmutable) {
                if (variable.name.startsWith("$_")) {
                    this.reporter.error(
                        variable,
                        this.ruleId,
                        `State variable ${variable.name
                        } should start with a dollar sign without underscore ($${variable.name.slice(
                            2
                        )})`
                    );
                    continue;
                }
                if (variable.name.startsWith("_")) {
                    this.reporter.error(
                        variable,
                        this.ruleId,
                        `State variable ${variable.name
                        } should start with a dollar sign without underscore ($${variable.name.slice(
                            1
                        )})`
                    );
                    continue;
                }
                if (!variable.name.startsWith("$")) {
                    this.reporter.error(
                        variable,
                        this.ruleId,
                        `State variable ${variable.name} should start with a dollar sign ($${variable.name})`
                    );
                    continue;
                }
            }
        }
    }

    FunctionDefinition(node) {
        for (const statement of node.body.statements) {
            if (statement.type === "VariableDeclarationStatement") {
                if (
                    statement.initialValue &&
                    statement.initialValue.type === "FunctionCall" &&
                    statement.initialValue.expression.type == "Identifier" &&
                    /^_get[A-Za-z0-9]+Storage$/.test(
                        statement.initialValue.expression.name
                    )
                ) {
                    for (const variable of statement.variables) {
                        if (
                            variable.storageLocation == "storage" &&
                            variable.name !== "$"
                        ) {
                            this.reporter.error(
                                variable,
                                this.ruleId,
                                `Unstructured storage pointer ${variable.name} should be named $`
                            );
                        }
                    }
                    continue;
                }
                if (statement.variables) {
                    for (const variable of statement.variables) {
                        if (!variable.name.startsWith("_")) {
                            this.reporter.error(
                                variable,
                                this.ruleId,
                                `Variable ${variable.name} should start with an underscore (_${variable.name})`
                            );
                        }
                    }
                }
            }
        }
    }
}

module.exports = VariablesNamingChecker;
