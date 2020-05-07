# Angular CLI Builders demo

How to run:
- clone this repo
- run `npm i`
- run `npm link`
- run `npm start`
- in an Angular project, run `npm link builders-demo`
- run `ng add builders-demo`
- run a target: `ng run <your-project-name>:shellCommand`

Targets (builders): 
- shellCommand - executes the specified shell command with the specified arguments
- addConfig - adds configurations to the shellCommand target - to run a different shell command

See the options of these builders in their `schema.json`.
Watch the changes in your project in `angular.json` - after `ng add` and after running the `addConfig` target.

Example:
`ng run proj-name:addConfig --configName=ngVersion --command=ng --args=v` 
