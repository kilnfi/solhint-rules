# custom solhint rules

```json
{
  "extends": "solhint:recommended",
  "plugins": ["kiln-rules"],
  "rules": {
    "kiln-rules/ordering": "error",
    "kiln-rules/ordering": "error",
    "kiln-rules/valid-storage-slot": "error",
    "kiln-rules/prefix-internal-functions-with-underscore": "error",
    "kiln-rules/prefix-private-functions-with-underscore": "error",
    "kiln-rules/header": ["error", ["// SPDX-License-Identifier: BUSL-1.1"]]
  }

```

## `kiln-rules/ordering`

This rule is similar to the default ordering rule from `solhint`, but instead of putting the error on all the elements after an element that is not ordered properly, the error is on the element that is too high in the file. Also, the rule is reported for ALL errors of the file and not just the first encountered one. This allows to efficiently disable the rule when needed, and still have reports on other errors.

- The rule adds methods with the `initializer` or `onlyInitializing` modifiers to the same section as constructors.
- The rule adds methods that match the `/^_get[A-Za-z0-9]*Storage$/` regex to the same section as constant variables declarations (ex: `_getContractStorage`). This allows putting the slot constant near its getter.

## kiln-rules/valid-storage-slot (fixable)

This rule ensures that constants that define computed storage slot values have the proper values they're expected to have. Any constant variables that ends with `_STORAGE_LOCATION` will be checked.

```
/// @custom:slot my.custom.slot.id
bytes32 internal constant CONTRACT_STORAGE_LOCATION = 0x71ef34a0eda6d4148718f0605e6c06e298a0d780cd2dab4d5212fe322358a800;
```

The rule will check that the value of `CONTRACT_STORAGE_LOCATION` is equal to `keccak256(abi.encode(uint256(keccak256("my.custom.slot.id")) - 1)) & ~bytes32(uint256(0xff))`. It will also check for the mandatory `@custom:slot` comment one line above the declaration.

`--fix` can be used to automatically apply the right value.

## kiln-rules/prefix-internal-functions-with-underscore & kiln-rules/prefix-private-functions-with-underscore

This rule checks that internal & private function names are prefixed with an underscore (`_`).

## kiln-rules/header

This rule ensures that the content before the `pragma solidity` directive is equal to a configurable value.

`--fix` can be used to automatically set the header to the right value.

## kiln-rules/variables-naming

This rule adds variables naming restrictions:

- The variables declared inside a function are prefixed with an underscore `_`.
- The storage variables (non-constant & non-immutable) are prefixed with a dollar sign `$`.
- The struct fields cannot be prefixed with a dollar sign `$` or an underscore `_`.
- The declaration of the unstructured storage pointer must be named `$`
