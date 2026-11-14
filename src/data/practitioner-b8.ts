// Sources checked live; examples are explicitly synthetic.
export const practitionerB8 = [
  {
    "slug": "zero-failures-small-ai-test",
    "title": "Zero failures in a small AI test does not mean zero risk",
    "type": "Analysis",
    "description": "A clean run needs a denominator and assumptions. Calculate how often a 1% failure process would pass a small test without exposing its failures.",
    "id": "calc-b1-zero-failures",
    "formula": "Under independent identical trials with fixed failure probability p, probability of zero failures in n trials=(1−p)^n. At p=0.01 and n=50,100,300, this is about 60.5%,36.6%,4.9%. For zero observed failures, one-sided exact 95% binomial upper bound=1−0.05^(1/n).",
    "assumptions": "A mathematical model of independent identical trials with a fixed 1% failure probability. The displayed upper bounds assume zero observed failures. No AI system was tested.",
    "limits": "Related fixtures, changing prompts or workload drift can invalidate the trial model. A frequentist bound is not a 95% probability statement about a particular model being safe; it covers only the defined failure and sampling assumptions.",
    "sources": [
      {
        "title": "NIST: binomial distribution",
        "url": "https://www.itl.nist.gov/div898/handbook/eda/section3/eda366i.htm",
        "claim": "The binomial model describes counts of binary outcomes over trials with a fixed probability. The zero-failure probability here follows by substituting zero into its probability formula.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b8.mjs",
    "data": "src/data/insights/2026-11-14-b8.json"
  },
  {
    "slug": "rare-class-ai-accuracy",
    "title": "A 99% classifier can miss every case you care about",
    "type": "Explainer",
    "description": "Accuracy can reward the majority class. A worked confusion matrix shows the missed cases and review queue hidden by one headline percentage.",
    "id": "calc-b1-rare-class",
    "formula": "For 1,000 synthetic cases with ten positives: always-negative gives TP=0,FN=10,FP=0,TN=990, accuracy=99%,recall=0%,precision undefined. Candidate gives TP=8,FN=2,FP=20,TN=970, accuracy=97.8%,recall=80%,precision=8/28≈28.6%.",
    "assumptions": "An invented binary classification task contains ten relevant positive cases and 990 negatives. Two constructed prediction sets are compared at fixed decisions.",
    "limits": "The class mix and errors are synthetic. Precision and recall will depend on the real workload and decision threshold. No model ranking or universal trade-off is established.",
    "sources": [
      {
        "title": "Google: accuracy, precision and recall",
        "url": "https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall",
        "claim": "Accuracy counts all correct classifications; recall counts detected actual positives; precision counts correct predicted positives. The guide explains why overall accuracy can mislead on imbalanced data.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b8.mjs",
    "data": "src/data/insights/2026-11-14-b8.json"
  },
  {
    "slug": "ai-judge-disagreement-log",
    "title": "Your AI judge needs a disagreement log",
    "type": "Explainer",
    "description": "Compare an automated grader with reviewed reference decisions before scaling it. Separate false accepts from false rejects and retain the cases behind the agreement rate.",
    "id": "calc-b1-judge-agreement",
    "formula": "Synthetic 100-case table: both accept=80,reference accept/judge reject=10,reference reject/judge accept=5,both reject=5. Agreement=(80+5)/100=85%; disagreement=15%; false accepts among ten reference rejects=5/10=50%.",
    "assumptions": "One hundred invented answers have binary reviewed reference labels and one automated judge label each. The human reference is the chosen test standard, not infallible truth.",
    "limits": "No judge was run. Agreement is specific to the rubric, case mix and labels. A high overall rate can conceal poor agreement on a small important group; this example does not estimate real judging reliability.",
    "sources": [
      {
        "title": "Claude: define success and build evaluations",
        "url": "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests",
        "claim": "The evaluation guide describes code, human and LLM grading. It recommends clear rubrics and testing LLM-grading reliability before scaling.",
        "checked": "14 November 2026"
      }
    ],
    "code": "scripts/insights/practitioner-b8.mjs",
    "data": "src/data/insights/2026-11-14-b8.json"
  }
];
