import { experimental, JsonParseMode, parseJson } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree
} from '@angular-devkit/schematics';
import { TargetDefinition } from '@angular-devkit/core/src/workspace';

const packageName = 'builders-demo';
const builders: { [name: string]: TargetDefinition } = {
  shellCommand: {
    builder: `${ packageName }:shellCommand`
  },
  addConfig: {
    builder: `${ packageName }:addConfig`
  }
};

function getWorkspace(
    host: Tree
): { path: string; workspace: experimental.workspace.WorkspaceSchema } {
  const possibleFiles = ['angular.json', '.angular.json'];
  const path = possibleFiles.filter(file => host.exists(file))[0];

  const configBuffer = host.read(path);
  if (configBuffer === null) {
    throw new SchematicsException(`Could not find angular.json`);
  }
  const content = configBuffer.toString();

  let workspace: experimental.workspace.WorkspaceSchema;
  try {
    workspace = (parseJson(
        content,
        JsonParseMode.Loose
    ) as {}) as experimental.workspace.WorkspaceSchema;
  } catch (e) {
    throw new SchematicsException(`Could not parse angular.json: ` + e.message);
  }

  return {
    path,
    workspace
  };
}

interface NgAddOptions {
  project: string;
}

export function ngAdd(options: NgAddOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const { path: workspacePath, workspace } = getWorkspace(tree);

    if (!options.project) {
      if (workspace.defaultProject) {
        options.project = workspace.defaultProject;
      } else {
        throw new SchematicsException(
            'No Angular project selected and no default project in the workspace'
        );
      }
    }

    const project = workspace.projects[options.project];
    if (!project) {
      throw new SchematicsException(
          'The specified Angular project is not defined in this workspace'
      );
    }

    if (!project.architect) {
      throw new SchematicsException(
          `Cannot read the architect configuration of the Angular project "${ options.project }" in angular.json`
      );
    }

    project.architect = { ...project.architect, ...builders };

    tree.overwrite(workspacePath, JSON.stringify(workspace, null, 2));
    return tree;
  };
}

