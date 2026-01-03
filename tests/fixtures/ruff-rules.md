# airflow-variable-name-task-id-mismatch (AIR001)

Derived from the **Airflow** linter.

## What it does
Checks that the task variable name matches the `task_id` value for
Airflow Operators.

## Why is this bad?
When initializing an Airflow Operator, for consistency, the variable
name should match the `task_id` value. This makes it easier to
follow the flow of the DAG.

## Example
```python
from airflow.operators import PythonOperator


incorrect_name = PythonOperator(task_id="my_task")
```

Use instead:
```python
from airflow.operators import PythonOperator


my_task = PythonOperator(task_id="my_task")
```

# sys-version-slice1 (YTT303)

Derived from the **flake8-2020** linter.

## What it does
Checks for uses of `sys.version[:1]`.

## Why is this bad?
If the major version number consists of more than one digit, this will
select the first digit of the major version number only (e.g., `"10.0"`
would evaluate to `"1"`). This is likely unintended, and can lead to subtle
bugs in future versions of Python if the version string is used to test
against a specific major version number.

Instead, use `sys.version_info.major` to access the current major version
number.

## Example
```python
import sys

sys.version[:1]  # If using Python 10, this evaluates to "1".
```

Use instead:
```python
import sys

f"{sys.version_info.major}"  # If using Python 10, this evaluates to "10".
```

## References
- [Python documentation: `sys.version`](https://docs.python.org/3/library/sys.html#sys.version)
- [Python documentation: `sys.version_info`](https://docs.python.org/3/library/sys.html#sys.version_info)

# missing-type-cls (ANN102)

Derived from the **flake8-annotations** linter.

## Removed
This rule has been removed because type checkers can infer this type without annotation.

## What it does
Checks that class method `cls` arguments have type annotations.

## Why is this bad?
Type annotations are a good way to document the types of function arguments. They also
help catch bugs, when used alongside a type checker, by ensuring that the types of
any provided arguments match expectation.

Note that many type checkers will infer the type of `cls` automatically, so this
annotation is not strictly necessary.

## Example

```python
class Foo:
    @classmethod
    def bar(cls): ...
```

Use instead:

```python
class Foo:
    @classmethod
    def bar(cls: Type["Foo"]): ...
```

# blocking-http-call-httpx-in-async-function (ASYNC212)

Derived from the **flake8-async** linter.

This rule is in preview and is not stable. The `--preview` flag is required for use.

## What it does
Checks that async functions do not use blocking httpx clients.

## Why is this bad?
Blocking an async function via a blocking HTTP call will block the entire
event loop, preventing it from executing other tasks while waiting for the
HTTP response, negating the benefits of asynchronous programming.

Instead of using the blocking `httpx` client, use the asynchronous client.

## Example
```python
import httpx


async def fetch():
    client = httpx.Client()
    response = client.get(...)
```

Use instead:
```python
import httpx


async def fetch():
    async with httpx.AsyncClient() as client:
        response = await client.get(...)
```

# pandas-df-variable-name (PD901)

Derived from the **pandas-vet** linter.

## Deprecated

This rule has been deprecated as it's highly opinionated and overly strict in most cases.

## What it does
Checks for assignments to the variable `df`.

## Why is this bad?
Although `df` is a common variable name for a Pandas `DataFrame`, it's not a
great variable name for production code, as it's non-descriptive and
prone to name conflicts.

Instead, use a more descriptive variable name.

## Example
```python
import pandas as pd

df = pd.read_csv("animals.csv")
```

Use instead:
```python
import pandas as pd

animals = pd.read_csv("animals.csv")
```

# non-pep604-isinstance (UP038)

Derived from the **pyupgrade** linter.

Fix is always available.

## Deprecation
This rule was deprecated as using [PEP 604] syntax in `isinstance` and `issubclass` calls
isn't recommended practice, and it incorrectly suggests that other typing syntaxes like [PEP 695]
would be supported by `isinstance` and `issubclass`. Using the [PEP 604] syntax
is also slightly slower.

## What it does
Checks for uses of `isinstance` and `issubclass` that take a tuple
of types for comparison.

## Why is this bad?
Since Python 3.10, `isinstance` and `issubclass` can be passed a
`|`-separated union of types, which is consistent
with the union operator introduced in [PEP 604].

Note that this results in slower code. Ignore this rule if the
performance of an `isinstance` or `issubclass` check is a
concern, e.g., in a hot loop.

## Example
```python
isinstance(x, (int, float))
```

Use instead:
```python
isinstance(x, int | float)
```

## Options
- `target-version`
