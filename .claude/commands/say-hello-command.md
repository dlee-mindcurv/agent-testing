# Say Hello Command

## Rules
- Do NOT modify any source files unless explicitly instructed
- Only READ from jobs.json, never write to it
- Only use tools explicitly mentioned in the steps

## Bootstrap
- set `STOP_LOOP_PROMISE` to "JOBS_COMPLETE"

## Skill resolution
Read the **Agent Skills Mapping** table from `CLAUDE.md`



## Steps

1. Use Bash to run `jq` against `jobs.json` (where `$APP_DIR` is the project root) to read each job's `name` `dependsOn`, and `complete` status:
   ```
   jq -r '.[] | "\(.name) \(.complete) \(.dependsOn)"' "jobs.json"
   ```

## Provision Agents

   - Read the output of the previous step 
   - If no agents are available with a `"complete":"pending"` status, output "No agents available with a pending status: <promise>`$STOP_LOOP_PROMISE`<promise>" and **exit** **DOING NOTHING ELSE**
   - If at least one agent is available with a `"complete":"pending"` status, **ONLY PROVISION THIS AGENT** if its `dependOn` value dependancy's `"complete":"pending"` status is `done` OR if its `dependOn` value is `null`. 
   - For **Provisioned Agent**:
       1. Parse each skill entry: if it ends with `:full`, strip the suffix and set target to `AGENTS.md`; otherwise set target to `SKILL.md`
       2. Resolve the file path in order:
          - `$HOME/.agents/skills/<skill-name>/<target>` (primary)
          - `$HOME/.claude/skills/<skill-name>/<target>` (fallback location 1)
          - `.agents/skills/<skill-name>/<target>` (fallback location 2)
          - `.claude/skills/<skill-name>/<target>` (fallback location 3)
          - If the target file doesn't exist at either location, try the other file (AGENTS.md → SKILL.md or vice versa) at both locations
       3. Read the resolved file content
       4. If not found at any location, log a warning but continue without that skill
       5. Store resolved skills as a mapping of agent type → list of `{name, content}` pairs for use during DISPATCH.
     
## Dispatch Agents
   - Skill content: include any `<skill>` blocks resolved for this agent type from the Provisioned Agent step. Wrap each skill's content as: `<skill name="skill-name">\n[file content]\n</skill>`
   - Use Bash to DISPATCH q provisioned agent with its associated skills.
   - Analyze the output of the agent to determine if it succeeded or failed.
   - If the agent succeeded, update the `jobs.json` file with the agent's name and `"complete":"done"`


## All Jobs Complete
Display a combined report showing each agent from the skills mapping table along with:
   - Its assigned skills (from CLAUDE.md)
   - Its job status (from jobs.json), or "no job found" if the agent isn't listed in jobs.json

Format the output as a readable markdown table:

| Agent | Skills | Job Status |
|-------|--------|------------|
| ... | ... | ... |
