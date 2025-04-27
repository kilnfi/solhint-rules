# custom solhint rules

```
{
	"extends": "solhint:recommended",
    "plugins": ["kiln-rules"],
	"rules": {
        "kiln-rules/ordering": "error"
	}
}
```

## `kiln-rules/ordering`

This rule is similar to the default ordering rule from `solhint`, but instead of putting the error on all the elements after an element that is not ordered properly, the error is on the element that is too high in the file. Also, the rule is reported for ALL errors of the file and not just the first encountered one. This allows to efficiently disable the rule when needed, and still have reports on other errors.

The rule adds methods with the `initializer` or `onlyInitializing` modifiers to the same section as constructors.
The rule adds methods that match the `/^_get[A-Za-z0-9]*Storage$/` regex to the same section as constant variables declarations (ex: `_getContractStorage`). This allows putting the slot constant near its getter.
