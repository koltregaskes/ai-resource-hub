# Workflow alert recorder

The recorder requires TLS with certificate verification using the Node platform
trust store. Connection URL `ssl`, `sslmode`, `sslcert`, `sslkey`, `sslrootcert`
and `uselibpqcompat` options are removed before passing the URL to pg, so URL
parsing cannot replace this policy or load certificate/key files. Other URL
options are preserved. A URL requesting plaintext or unverified TLS is upgraded
to verified TLS; a server without a trusted certificate fails delivery.

Run the offline regression with:

```sh
node --test .github/scripts/record-workflow-alert.test.mjs
node --check .github/scripts/record-workflow-alert.mjs
```

The regression reads source and injects synthetic process, filesystem and pg
objects into a VM. It never reads real environment/credential files or loads pg.
Its fake trusted/untrusted peers verify the connection policy and recorder
control flow, including an intentionally unsafe negative control. It does not
prove a real TLS handshake, installed pg parsing, database schema, unique
constraint, GitHub workflow syntax, ledger delivery or NOW reader visibility.
Those remain owner-controlled acceptance dependencies, followed by independent
review of the exact repair head. No live self-test is part of this regression.
