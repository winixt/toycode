import { join } from 'path';
import { getProjectPath } from './utils';
import fse from 'fs-extra';
import { DependentResource, PreChangeFile } from './type';

export function genDependencies(
    dependentResources: DependentResource[],
): PreChangeFile {
    const pkgPath = join(getProjectPath(), 'package.json');
    const pkg = fse.readJSONSync(pkgPath);

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
