import os

files = [
  '00_PROJECT_CHARTER.md',
  '01_PROBLEM_STATEMENT.md',
  '02_SOLUTION.md',
  '03_PRODUCT_VISION.md',
  '04_MVP_SCOPE.md',
  '05_NON_GOALS.md',
  '10_REQUIREMENTS.md',
  '11_USER_STORIES.md',
  '12_USER_FLOWS.md',
  '13_PERMISSION_MODEL.md',
  '20_SYSTEM_ARCHITECTURE.md',
  '21_TECH_STACK.md',
  '22_TECH_STACK_FLOW.md',
  '23_DATA_FLOW.md',
  '24_API_ARCHITECTURE.md',
  '30_CONSENZO_AGENT.md',
  '31_AGENT_LOOP.md',
  '32_PREFERENCE_WORLD_MODEL.md',
  '33_CONSTRAINT_ENGINE.md',
  '34_SCORING_ENGINE.md',
  '35_CONFLICT_DETECTION.md',
  '36_FAIRNESS_ENGINE.md',
  '37_EXPERIENCE_MEMORY.md',
  '40_CONTROLLED_CATALOG.md',
  '41_CATALOG_STATE.md',
  '42_CATALOG_TOOLS.md',
  '43_CATALOG_FAILURES.md',
  '50_FRONTEND_ARCHITECTURE.md',
  '51_MOBILE_UI.md',
  '52_PC_UI.md',
  '53_PWA.md',
  '60_AWS_ARCHITECTURE.md',
  '61_AWS_SERVICES.md',
  '62_BEDROCK.md',
  '63_STRANDS.md',
  '64_LAMBDA.md',
  '65_API_GATEWAY.md',
  '66_DYNAMODB.md',
  '67_S3.md',
  '68_STEP_FUNCTIONS.md',
  '69_EVENTBRIDGE.md',
  '70_API_CONTRACTS.md',
  '71_GROUP_API.md',
  '72_CONSENZO_API.md',
  '80_SECURITY.md',
  '81_DATA_PRIVACY.md',
  '82_SECRETS.md',
  '90_EVALUATION.md',
  '91_SEARCH_FILTER_BENCHMARK.md',
  '92_CHATGPT_BENCHMARK.md',
  '93_CONSENZO_BENCHMARK.md',
  '94_COMPARISON_RESULTS.md',
  '95_DEMO_SCRIPT.md',
  '96_DEMO_RUNBOOK.md',
  '97_BACKUP_DEMO.md',
  '100_DAY_1.md',
  '101_DAY_2.md',
  '102_POST_HACKATHON.md',
  '103_RELEASE_CHECKLIST.md',
  '110_DECISIONS.md',
  '111_RISKS.md',
  '112_KNOWN_LIMITATIONS.md',
  '113_CHANGELOG.md'
]

docs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'docs')
os.makedirs(docs_dir, exist_ok=True)

for f in files:
    title_raw = f.split('_', 1)[1].replace('.md', '').replace('_', ' ')
    title = title_raw.title()
    path = os.path.join(docs_dir, f)
    content = f"# {title}\n\n# Status\n\nPlanned — this document will be completed after the foundation phase.\n"
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(content)

print(f"Successfully initialized {len(files)} docs.")
