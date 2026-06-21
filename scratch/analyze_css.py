import re
from collections import defaultdict

css_path = "/home/devchan/Work/git-repos/work/projects/studypy2/frontend/style.css"

with open(css_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove comments
content_clean = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

def parse_css(css_text):
    rules = []
    stack = []
    current_selector = ""
    start_idx = 0
    
    for i, char in enumerate(css_text):
        if char == '{':
            if not stack:
                current_selector = css_text[start_idx:i].strip()
            stack.append(i)
        elif char == '}':
            if stack:
                open_idx = stack.pop()
                if not stack:
                    body = css_text[open_idx+1:i].strip()
                    rules.append((current_selector, body))
                    start_idx = i + 1
    return rules

rules = parse_css(content_clean)

empty_rules = []
duplicate_properties = []
hardcoded_colors = []

# Regex for hex/rgb colors (ignoring transparent, none, inherit, var)
color_regex = re.compile(r'#([a-fA-F0-9]{3,8})\b|rgb\([^)]+\)|hsl\([^)]+\)')

for sel, body in rules:
    if not body.strip():
        empty_rules.append(sel)
        continue
    
    # Check duplicate properties in the same body
    props = [p.split(":")[0].strip().lower() for p in body.split(";") if ":" in p]
    seen_props = set()
    for prop in props:
        if prop in seen_props:
            duplicate_properties.append((sel, prop))
        seen_props.add(prop)
        
    # Check hardcoded colors
    matches = color_regex.findall(body)
    if matches and not sel.strip().startswith(":root"):
        # Find all actual color declarations
        for decl in body.split(";"):
            if any(x in decl.lower() for x in ["color", "background", "border", "box-shadow"]):
                if not "var(" in decl and color_regex.search(decl):
                    hardcoded_colors.append((sel, decl.strip()))

print(f"Total rules checked: {len(rules)}")
print(f"Empty rulesets found: {len(empty_rules)}")
for r in empty_rules[:5]:
    print(f"  - {r}")
    
print(f"Duplicate properties inside same ruleset: {len(duplicate_properties)}")
for r, p in duplicate_properties[:10]:
    print(f"  - {r} has duplicate property '{p}'")

print(f"Declarations using hardcoded colors instead of var(): {len(hardcoded_colors)}")
for r, d in hardcoded_colors[:15]:
    print(f"  - {r} -> {d}")
