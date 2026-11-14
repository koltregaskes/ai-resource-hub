# 14 November cohort/value correction

Issue: koltregaskes/rooms-os-hub#1568. PR: #124.

The original snapshot is byte-for-byte preserved. Method 0.3.1 admits seven labs from its original mapped Epoch models. Method 0.3.2 adds checked organisation aliases (Meta AI, Moonshot, Z.ai (Zhipu AI), Nvidia) and exact GLM-5.3 / Qwen 3.8 Max identities from the same archived Epoch CSV. Formulas and ranking thresholds are unchanged. Eleven labs are listed; none meets the composite coverage threshold.

Source: Epoch AI ECI, https://epoch.ai/data/eci_scores.csv, archived 2026-11-14, SHA-256 2e84d024de3b0b838f4e33229e3082738fed6b3f98d4b199e25b6abe01faac19, CC BY 4.0; terms/provenance review remains the original snapshot's sourceCheck. ECI/date facts are reused under that existing admission, not refreshed. No new price or openness-grade claims are imported. Unknowns remain missing.

Reproduce latest correction: `node scripts/rescore-lab-standings.mjs 2026-11-14` in a scratch checkout without the target re-score file (writer uses wx and refuses overwrites). The script checks the CSV hash against the original input receipt, merges exact identities and writes rescored/0.3.2. The 0.3.1 generator is retained in commit 698fdba365a600d826c722de3d158f6df3e79dbf.

Verification: regression tests committed before implementation; baseline regression failed; isolated JavaScript harness passes 12 test bodies. Local shell/Node launcher fails before execution, so native tests and Astro build must be evidenced by Validate CI. No rendered verification or second-agent review is claimed. No secrets, paid calls, merge or deploy.
