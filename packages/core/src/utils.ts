import { join, extname } from 'path';
import prettier from 'prettier';
import fse from 'fs-extra';
import { ImportResource } from './type';

export function getProjectPath() {
    return process.cwd();
}

export function getSrcPath() {
    return 'src';
}

export function getAbsSrcPath() {
    return join(getProjectPath(), 'src');
}

export function getFileName(fileName: string, ext: string) {
    if (extname(fileName) === ext) {
        return fileName;
    }
    return fileName + ext;
}

export function readTextFile(filePath: string) {
    return fse.readFileSync(filePath, 'utf-8');
}

export function genSingleImport(imports: ImportResource[]) {
    if (!imports.length) return '';
    const resoure = imports[0].resoure;
    const importNames: string[] = [];
    let defaultImport: string;
    for (const imp of imports) {
        if (imp.isDefaultImport) {
            defaultImport = imp.importName;
            return `import ${imp.importName}} from '${imp.resoure}'`;
        } else if (imp.aliasName) {
            importNames.push(`${imp.importName} as ${imp.aliasName}`);
        } else {
            importNames.push(imp.importName);
        }
    }

    if (defaultImport && !importNames.length) {
        return `import ${defaultImport}} from '${resoure}';`;
    }
    if (!defaultImport && importNames.length) {
        return `import {${importNames.join(', ')}} from '${resoure}';`;
    }
    return `import ${defaultImport}, {${importNames.join(
        ', ',
    )}} from '${resoure}';`;
}

export function genImportCode(imports: ImportResource[]) {
    const categorizeImports = new Map<string, ImportResource[]>();

    for (const imp of imports) {
        if (categorizeImports.has(imp.resoure)) {
            categorizeImports.get(imp.resoure).push(imp);
        } else {
            categorizeImports.set(imp.resoure, [imp]);
        }
    }

    const result: string[] = [];
    for (const [resoure, imps] of categorizeImports) {
        result.push(genSingleImport(imps));
    }

    return result.join('\n');
}

// TODO 自定义格式化代码
export const formatCode = (code: string, parser?: string) => {
    return prettier.format(code, {
        parser: parser ?? 'babel',
        semi: true,
        trailingComma: 'all',
        singleQuote: true,
        tabWidth: 4,
        useTabs: false,
        printWidth: 160,
    });
};
