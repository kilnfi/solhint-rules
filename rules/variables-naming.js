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

    processBody(body) {
        for (const statement of body.statements) {
            if (
                statement.type === "ForStatement" ||
                statement.type === "WhileStatement"
            ) {
                this.processBody(statement.body);
            }

            if (statement.type === "IfStatement") {
                if (statement.trueBody) {
                    this.processBody(statement.trueBody);
                }
                if (statement.falseBody) {
                    if (statement.falseBody.type === "IfStatement") {
                        if (statement.falseBody.trueBody) {
                            this.processBody(statement.falseBody.trueBody);
                        }
                        if (statement.falseBody.falseBody) {
                            this.processBody(statement.falseBody.falseBody);
                        }
                    } else {
                        this.processBody(statement.falseBody);
                    }
                }
            }

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
                        if (variable.storageLocation == "storage") {
                            if (!variable.name.startsWith("$")) {
                                this.reporter.error(
                                    variable,
                                    this.ruleId,
                                    `Storage pointer variable ${variable.name} should start with a dollar sign ($${variable.name})`
                                );
                            }
                        } else {
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

    FunctionDefinition(node) {
        this.processBody(node.body);
        for (const parameter of node.parameters) {
            if (
                parameter.storageLocation !== "storage" &&
                (parameter.name.startsWith("$") || parameter.name.startsWith("_"))
            ) {
                this.reporter.error(
                    parameter,
                    this.ruleId,
                    `Function parameter ${parameter.name
                    } should not start with a dollar sign or an underscore (${parameter.name.slice(
                        1
                    )})`
                );
            }
        }
        for (const parameter of node.returnParameters) {
            if (
                parameter.storageLocation !== "storage" &&
                (parameter.name.startsWith("$") || parameter.name.startsWith("_"))
            ) {
                this.reporter.error(
                    parameter,
                    this.ruleId,
                    `Function return parameter ${parameter.name
                    } should not start with a dollar sign or an underscore (${parameter.name.slice(
                        1
                    )})`
                );
            }
        }
    }
}

module.exports = VariablesNamingChecker;
