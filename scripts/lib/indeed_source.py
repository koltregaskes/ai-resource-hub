"""Resolve a CSV release independently of unrelated repository changes."""
import json

def source_revision(get):
    api='https://api.github.com/repos/hiring-lab/ai-tracker/'
    head=json.loads(get(api+'commits/main'))['sha']
    releases=json.loads(get(api+f'commits?path=AI_posting.csv&sha={head}&per_page=1'))
    if not releases:
        raise RuntimeError('No CSV release commit found')
    release=releases[0]
    return head,release['sha'],release['commit']['committer']['date'][:10]
