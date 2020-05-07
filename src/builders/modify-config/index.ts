import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { normalize, JsonObject, workspaces } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';

interface Options extends JsonObject {
  target: string;
  configName: string;
  command: string;
  args: string[];
  exec: boolean;
}

export default createBuilder<Options>(async (options: Options, context: BuilderContext): Promise<BuilderOutput> => {
  const root = normalize(context.workspaceRoot);

  if (!context.target || !context.target.project) {
    throw new Error('No project is specified! Aborting.');
  }

  const projectName = context.target.project;
  // NodeJsSyncHost - An implementation of the Virtual FS using Node as the backend, synchronously.
  const host = workspaces.createWorkspaceHost(new NodeJsSyncHost());
  const { workspace } = await workspaces.readWorkspace(root, host);

  const project = workspace.projects.get(projectName);

  if (!project) {
    throw new Error('app does not exist');
  }

  let target = project.targets.get(options.target); // returns a ref to the build target, not a copy
  if (!target) {
    target = project.targets.add({ name: options.target, builder: 'builders-demo:shellCommand' });
  }

  let configObj;
  if (options.configName) {
    if (!target.configurations) {
      target.configurations = {};
    }
    configObj = target.configurations;
  } else {
    if (!target.options) {
      target.options = {};
    }
    configObj = target.options;
  }

  configObj.command = options.command;
  configObj.args = options.args;

  // update .angular.json with the new project config (within workspace)
  await workspaces.writeWorkspace(workspace, host);

  if (options.exec) {
    context.logger.info(`📦 Running "${options.target}" on "${context.target.project}"`);

    const run = await context.scheduleTarget({
      target: options.target,
      project: context.target.project
    });
    const targetResult = await run.result;
    if (!targetResult.success) {
      throw new Error(`Target failed: ${targetResult.error}`);
    }
  }

  return { success: true };
});
