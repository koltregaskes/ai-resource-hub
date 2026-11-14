"""Bootstrap intervals for the Day-to-Day Bench.

Implements docs/DAY-TO-DAY-BENCH-METHOD.md, sections "Intervals" and
"Comparing models", exactly:

- one generator per report: numpy.random.default_rng(20261114) (PCG64);
- 20,000 resamples;
- for each resample, families in order 1 to 7; within a family, tasks sorted
  by id; rng.integers(0, n, size=n) draws n indices with replacement, where n
  is the number of tasks in that family;
- the unit resampled is the task score, so a task's 3 slots stay together;
- the same index draws are used for every model;
- the equal-family score is recomputed on each resample;
- the interval is the 2.5th to 97.5th percentile, NumPy's default linear
  interpolation.

Draw order within one report, fixed so results can be reproduced: all 20,000
resamples for the full task set ("main"), then all 20,000 for the public
tasks, then all 20,000 for the held-out tasks. A family with no tasks in a
subset draws nothing.

Task ids are sorted as plain strings (Python's default, by code point).

A report is final or provisional, and says which. A run with a pending slot
is refused unless allow_pending=True; then the pending slot counts as not
passed and the report, and every paired difference in it, carries
"provisional": true with the count and ids of the pending slots per model.
A provisional interval is not a result and is never published.
"""

try:
    import numpy as np
except ImportError as exc:  # pragma: no cover - exercised only without NumPy
    raise ImportError(
        "bootstrap.py needs NumPy (the method fixes NumPy's default_rng and "
        "percentile). Install it with: python -m pip install numpy"
    ) from exc

try:  # works when the folder is a package
    from . import scores as _scores
except ImportError:  # works when the folder is on sys.path
    import scores as _scores

SEED = 20261114
RESAMPLES = 20000
PERCENTILES = (2.5, 97.5)
SETS = ("main", "public", "held-out")
NOT_ENOUGH_VARIATION = "not enough variation to estimate"
GENERATOR = "numpy.random.default_rng(%d) (PCG64)" % SEED


def make_draws(family_sizes, rng, resamples=RESAMPLES):
    """Draw the resampling indices for one task set.

    family_sizes maps family number to its task count. Returns
    {family: int array of shape (resamples, n)}. The generator is advanced in
    the method's order: resample by resample, families 1 to 7 inside each.
    """
    families = [family for family in _scores.FAMILIES if family_sizes.get(family, 0) > 0]
    draws = {
        family: np.empty((resamples, family_sizes[family]), dtype=np.int64)
        for family in families
    }
    for resample in range(resamples):
        for family in families:
            n = family_sizes[family]
            draws[family][resample] = rng.integers(0, n, size=n)
    return draws


def percentile_interval(values):
    """The 2.5th and 97.5th percentiles as a (lower, upper) pair of floats."""
    lower, upper = np.percentile(np.asarray(values, dtype=np.float64), PERCENTILES)
    return float(lower), float(upper)


def intervals_overlap(a, b):
    """True when max(lower bounds) <= min(upper bounds), on unrounded values.

    Each argument is a (lower, upper) pair or a dict with "lower" and "upper".
    Intervals that only touch count as overlapping. This is a display label
    ("95% intervals overlap"), not a test of difference and not evidence that
    two models are equal. It does not chain: A overlapping B and B overlapping
    C says nothing about A and C.
    """
    low_a, high_a = _bounds(a)
    low_b, high_b = _bounds(b)
    return max(low_a, low_b) <= min(high_a, high_b)


def _bounds(interval):
    if isinstance(interval, dict):
        lower, upper = interval.get("lower"), interval.get("upper")
    else:
        lower, upper = interval
    if lower is None or upper is None:
        raise ValueError("interval has no bounds (it was not estimated)")
    return lower, upper


class BootstrapReport:
    """All resamples for one report. Build it once and read everything off it.

    Attributes, each keyed by set name ("main", "public", "held-out"):
    - task_ids[set][family]: the task ids, sorted, that index 0..n-1 refer to;
    - draws[set][family]: the index draws, shape (resamples, n), shared by
      every model;
    - family_resamples[set][model][family]: resampled family scores;
    - headline_resamples[set][model]: resampled Day-to-Day scores, or None
      when a family has no tasks in that set.

    provisional is True when any slot is pending (only possible with
    allow_pending=True); pending_slot_ids[model] lists them as
    "<task id>/<repeat>".
    """

    def __init__(self, slots, resamples=RESAMPLES, seed=SEED, allow_pending=False):
        grouped = _scores.validate_slots(slots, allow_pending=allow_pending)
        self.resamples = resamples
        self.seed = seed
        self.models = sorted(grouped)
        self.pending_slot_ids = {
            model: _scores.pending_slot_ids(grouped[model]) for model in self.models
        }
        self.provisional = any(self.pending_slot_ids[model] for model in self.models)
        rng = np.random.default_rng(seed)  # created once per report

        self.task_ids = {}
        self.draws = {}
        self.task_scores = {}
        self.family_resamples = {}
        self.headline_resamples = {}
        self.missing_families = {}

        reference = grouped[self.models[0]]
        for set_name in SETS:  # fixed order: main, public, held-out
            ids = {
                family: sorted(
                    task_id
                    for task_id, task in reference.items()
                    if task["family"] == family
                    and (set_name == "main" or task["split"] == set_name)
                )
                for family in _scores.FAMILIES
            }
            sizes = {family: len(ids[family]) for family in _scores.FAMILIES}
            present = [family for family in _scores.FAMILIES if sizes[family] > 0]
            self.task_ids[set_name] = ids
            self.missing_families[set_name] = [
                family for family in _scores.FAMILIES if sizes[family] == 0
            ]
            self.draws[set_name] = make_draws(sizes, rng, resamples)

            self.task_scores[set_name] = {}
            self.family_resamples[set_name] = {}
            self.headline_resamples[set_name] = {}
            for model in self.models:
                scores_by_family = {
                    family: np.array(
                        [_scores.task_score(grouped[model][task_id]) for task_id in ids[family]],
                        dtype=np.float64,
                    )
                    for family in present
                }
                family_resamples = {
                    family: scores_by_family[family][self.draws[set_name][family]].mean(axis=1)
                    * 100.0
                    for family in present
                }
                self.task_scores[set_name][model] = scores_by_family
                self.family_resamples[set_name][model] = family_resamples
                if self.missing_families[set_name]:
                    self.headline_resamples[set_name][model] = None
                else:
                    total = np.zeros(resamples, dtype=np.float64)
                    for family in _scores.FAMILIES:
                        total = total + family_resamples[family]
                    self.headline_resamples[set_name][model] = total / len(_scores.FAMILIES)

    # -- intervals ---------------------------------------------------------

    def _degenerate_families(self, set_name, model):
        """Families whose task scores are all identical for this model."""
        return [
            family
            for family, values in self.task_scores[set_name][model].items()
            if np.all(values == values[0])
        ]

    def family_interval(self, model, family, set_name="main"):
        values = self.task_scores[set_name][model].get(family)
        if values is None:
            return {"lower": None, "upper": None, "flag": "no tasks in this family", "tasks": 0}
        if family in self._degenerate_families(set_name, model):
            return {
                "lower": None,
                "upper": None,
                "flag": NOT_ENOUGH_VARIATION,
                "tasks": int(values.size),
            }
        lower, upper = percentile_interval(self.family_resamples[set_name][model][family])
        return {"lower": lower, "upper": upper, "flag": None, "tasks": int(values.size)}

    def headline_interval(self, model, set_name="main"):
        missing = self.missing_families[set_name]
        degenerate = self._degenerate_families(set_name, model)
        if missing:
            return {
                "lower": None,
                "upper": None,
                "flag": "no tasks in family %s" % ", ".join(str(f) for f in missing),
                "note": None,
                "degenerate_families": degenerate,
            }
        if len(degenerate) == len(_scores.FAMILIES):
            return {
                "lower": None,
                "upper": None,
                "flag": NOT_ENOUGH_VARIATION,
                "note": None,
                "degenerate_families": degenerate,
            }
        lower, upper = percentile_interval(self.headline_resamples[set_name][model])
        note = None
        if degenerate:
            note = "no variation in family %s" % ", ".join(str(f) for f in degenerate)
        return {
            "lower": lower,
            "upper": upper,
            "flag": None,
            "note": note,
            "degenerate_families": degenerate,
        }

    # -- paired differences ------------------------------------------------

    def difference_resamples(self, model_a, model_b, set_name="main"):
        """Headline of model_a minus model_b on each resample (same draws)."""
        a = self.headline_resamples[set_name][model_a]
        b = self.headline_resamples[set_name][model_b]
        if a is None or b is None:
            return None
        return a - b

    def paired_difference(self, model_a, model_b, set_name="main"):
        """The paired difference (a minus b) with its own percentile interval.

        Descriptive only: the method claims no significance from it.
        """
        differences = self.difference_resamples(model_a, model_b, set_name)
        if differences is None:
            return {
                "model_a": model_a,
                "model_b": model_b,
                "set": set_name,
                "provisional": self._pair_provisional(model_a, model_b),
                "difference": None,
                "lower": None,
                "upper": None,
                "flag": "no tasks in family %s"
                % ", ".join(str(f) for f in self.missing_families[set_name]),
            }
        point = self._point(model_a, set_name) - self._point(model_b, set_name)
        lower, upper = percentile_interval(differences)
        return {
            "model_a": model_a,
            "model_b": model_b,
            "set": set_name,
            "provisional": self._pair_provisional(model_a, model_b),
            "difference": point,
            "lower": lower,
            "upper": upper,
            "flag": None,
        }

    def _pair_provisional(self, model_a, model_b):
        return bool(self.pending_slot_ids[model_a] or self.pending_slot_ids[model_b])

    def _point(self, model, set_name):
        """The observed equal-family score on this set, without resampling."""
        family_means = [
            float(self.task_scores[set_name][model][family].mean()) * 100.0
            for family in _scores.FAMILIES
        ]
        return sum(family_means) / len(family_means)

    # -- output ------------------------------------------------------------

    def to_dict(self, pairs=()):
        """Plain, JSON-serialisable summary with unrounded floats.

        pairs is an optional list of (model_a, model_b) to add paired
        differences on the full task set.

        "provisional" is always present: false for a final report, true when
        any slot is pending. "pending_slots" and "pending_slot_ids" are keyed
        by model, and each model's own block repeats its flag and count.
        """
        models = {}
        for model in self.models:
            models[model] = {
                "provisional": bool(self.pending_slot_ids[model]),
                "pending_slots": len(self.pending_slot_ids[model]),
            }
            for set_name in SETS:
                models[model][set_name] = {
                    "day_to_day_interval": self.headline_interval(model, set_name),
                    "family_intervals": {
                        str(family): self.family_interval(model, family, set_name)
                        for family in _scores.FAMILIES
                    },
                }
        return {
            "method": "percentile bootstrap, stratified by family, unit = task score",
            "provisional": self.provisional,
            "pending_slots": {
                model: len(self.pending_slot_ids[model]) for model in self.models
            },
            "pending_slot_ids": {
                model: list(self.pending_slot_ids[model]) for model in self.models
            },
            "generator": GENERATOR if self.seed == SEED else "numpy.random.default_rng(%d)" % self.seed,
            "seed": self.seed,
            "resamples": self.resamples,
            "percentiles": list(PERCENTILES),
            "draw_order": list(SETS),
            "family_sizes": {
                set_name: {
                    str(family): len(self.task_ids[set_name][family])
                    for family in _scores.FAMILIES
                }
                for set_name in SETS
            },
            "models": models,
            "paired_differences": [self.paired_difference(a, b) for a, b in pairs],
        }


def bootstrap_report(slots, pairs=(), resamples=RESAMPLES, seed=SEED, allow_pending=False):
    """Validate the slots, run the bootstrap and return the summary dict."""
    report = BootstrapReport(slots, resamples=resamples, seed=seed, allow_pending=allow_pending)
    return report.to_dict(pairs=pairs)
