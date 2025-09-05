const Ordering = require("./rules/ordering.js");
const ValidStorageSlot = require("./rules/valid-storage-slot.js");
const PrefixInternalFunctionsWithUnderscore = require("./rules/prefix_internal_functions_with_underscore.js");
const PrefixPrivateFunctionsWithUnderscore = require("./rules/prefix_private_functions_with_underscore.js");
const Header = require("./rules/header.js");
const VariablesNaming = require("./rules/variables-naming.js");
const CompilerVersion = require("./rules/compiler-version.js");
const NoVmRandomAddress = require("./rules/no-vm-random-address.js");

module.exports = [
    Ordering,
    ValidStorageSlot,
    PrefixInternalFunctionsWithUnderscore,
    PrefixPrivateFunctionsWithUnderscore,
    Header,
    VariablesNaming,
    CompilerVersion,
    NoVmRandomAddress
];
