"""Key loading for the Day-to-Day Bench run path.

The method allows one route only: the keys sit in the owner's private key
file, and the running harness loads the named entries into its own memory.

What this module guarantees:

- The file is read line by line. A line whose name is not on the configured
  list is skipped without its value being sliced out, parsed or stored.
- Only the first listed name found for each provider is kept. Any other
  listed name that was found is dropped before the function returns.
- Values live inside `Secret` objects whose repr, str and format output
  never show the value, and which refuse to be pickled or copied.
- Nothing is logged, nothing is written to `os.environ`, and no exception
  raised here carries a value from the file.

Reading a file buffers bytes inside the interpreter for a moment. This is
not a defence against a memory dump of the harness process.
"""

import os
import re

FORBIDDEN_ENVIRONMENT_NAMES = ("OPENAI_API_KEY", "ANTHROPIC_API_KEY")
_NAME = re.compile(r"[A-Za-z_][A-Za-z0-9_]{0,79}\Z")
_EXPORT = re.compile(r"export\s+")
_HIDDEN = "<secret>"


class KeyNotFound(Exception):
    """None of the listed names for a provider is in the key file."""


class KeyFileError(Exception):
    """The key file is unusable. The message never holds a value."""


class EnvironmentNotClean(Exception):
    """A provider key variable is set in the harness environment."""


class Secret:
    """Holds one key. Only `reveal()` returns it, for the HTTP client."""

    __slots__ = ("_value",)

    def __init__(self, value):
        object.__setattr__(self, "_value", value)

    def reveal(self):
        if self._value is None:
            raise KeyFileError("no key is loaded in a dry run")
        return self._value

    def found_in(self, text):
        """True when the value appears in text. Used to guard records."""
        return bool(self._value) and self._value in text

    def __setattr__(self, name, value):
        raise AttributeError("Secret is read-only")

    def __repr__(self):
        return _HIDDEN

    __str__ = __repr__

    def __format__(self, spec):
        return _HIDDEN

    def __reduce__(self):
        raise TypeError("Secret cannot be pickled or copied")

    __reduce_ex__ = lambda self, protocol: self.__reduce__()  # noqa: E731

    @classmethod
    def placeholder(cls):
        """A stand-in for dry runs. `reveal()` raises."""
        return cls(None)


class LoadedKeys:
    """The keys kept from the file: one `Secret` per provider."""

    __slots__ = ("_secrets",)

    def __init__(self, secrets):
        object.__setattr__(self, "_secrets", dict(secrets))

    def __setattr__(self, name, value):
        raise AttributeError("LoadedKeys is read-only")

    def providers(self):
        return sorted(self._secrets)

    def secret(self, provider):
        return self._secrets[provider]

    def leaks_into(self, text):
        """True when any loaded value appears in text."""
        return any(secret.found_in(text) for secret in self._secrets.values())

    def __repr__(self):
        return "<LoadedKeys providers=%s>" % ",".join(self.providers())

    __str__ = __repr__

    def __format__(self, spec):
        return repr(self)

    def __reduce__(self):
        raise TypeError("LoadedKeys cannot be pickled or copied")

    __reduce_ex__ = lambda self, protocol: self.__reduce__()  # noqa: E731


def assert_clean_environment(environ=None):
    """Refuse to proceed while a provider key variable is set."""
    env = os.environ if environ is None else environ
    for name in FORBIDDEN_ENVIRONMENT_NAMES:
        if name in env:
            raise EnvironmentNotClean(
                "refusing to start: %s is set in the environment" % name)


def _checked_names(names_by_provider):
    if not isinstance(names_by_provider, dict) or not names_by_provider:
        raise KeyFileError("key names must be given per provider")
    checked = {}
    seen = set()
    for provider, names in names_by_provider.items():
        if isinstance(names, str):
            names = [names]
        if not isinstance(names, (list, tuple)) or not names:
            raise KeyFileError("no key names listed for provider " + str(provider))
        for name in names:
            if not isinstance(name, str) or not _NAME.match(name):
                raise KeyFileError("invalid key name listed for provider " + str(provider))
            folded = name.casefold()
            if folded in seen:
                raise KeyFileError("key name listed twice: " + name)
            seen.add(folded)
        checked[provider] = list(names)
    return checked


def load_keys(key_file_path, names_by_provider):
    """Load the first listed name found for each provider.

    Entries look like `NAME=value`, with an optional leading `export ` and
    optional matching quotes round the value. Name matching ignores case.
    A missing provider raises `KeyNotFound("key not found: <first name>")`.
    """
    names = _checked_names(names_by_provider)
    listed = {}
    for alternatives in names.values():
        for name in alternatives:
            listed[name.casefold()] = name
    found = {}
    problem = None
    try:
        with open(key_file_path, encoding="utf-8-sig") as stream:
            for line in stream:
                equals = line.find("=")
                if equals < 0:
                    continue
                folded = _EXPORT.sub("", line[:equals].strip(), count=1).strip().casefold()
                if folded not in listed:
                    # Not a listed name: the value is never sliced out.
                    continue
                if folded in found:
                    problem = "duplicate entry for: " + listed[folded]
                    break
                value = line[equals + 1:].strip()
                if value[:1] in ("'", '"'):
                    if len(value) < 2 or value[-1] != value[0]:
                        problem = "invalid entry for: " + listed[folded]
                        break
                    value = value[1:-1]
                if not value or any(char.isspace() for char in value):
                    problem = "invalid entry for: " + listed[folded]
                    break
                found[folded] = value
            line = None
            value = None
    except OSError:
        found.clear()
        raise KeyFileError("key file unavailable") from None
    except UnicodeError:
        found.clear()
        raise KeyFileError("key file is not valid UTF-8") from None
    if problem:
        found.clear()
        raise KeyFileError(problem)
    kept = {}
    missing = None
    for provider, alternatives in names.items():
        for name in alternatives:
            if name.casefold() in found:
                kept[provider] = Secret(found[name.casefold()])
                break
        else:
            missing = missing or alternatives[0]
    found.clear()
    if missing:
        kept.clear()
        raise KeyNotFound("key not found: " + missing)
    return LoadedKeys(kept)
