import { join } from 'path';
import { getProjectPath } from './utils';
import { readJSONSync } from 'fs-extra';
import { DependentResource, PreChangeFile, Config } from './type';

export function genDependencies(
    dependentResources: DependentResource[],
    config: Config = {},
): PreChangeFile {
    const pkgPath = join(getProjectPath(config.projectDir), 'package.json');
    const pkg = readJSONSync(pkgPath);

    for (const dep of dependentResources) {
        if (!pkg.dependencies[dep.package]) {
            pkg.dependencies[dep.package] = dep.version;
        }
    }

    return {
        file: 'package.json',
        content: JSON.stringify(pkg.dependencies, null, 4),
    };
}
