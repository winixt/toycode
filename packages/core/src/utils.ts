import { join, extname } from 'path';
import prettier from 'prettier';
import fse from 'fs-extra';
import { ImportSource, ImportType } from './type';

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

export function genSingleImport(imports: ImportSource[]) {
    if (!imports.length) return '';
    const source = imports[0].source;
    const importNames: string[] = [];
    let defaultImport: string;
    for (const imp of imports) {
        if (imp.type === ImportType.ImportDefaultSpecifier) {
            defaultImport = imp.imported;
        } else if (imp.local && imp.local !== imp.imported) {
            importNames.push(`${imp.imported} as ${imp.local}`);
        } else {
            importNames.push(imp.imported);
        }
    }

    if (defaultImport && !importNames.length) {
        return `import ${defaultImport}} from '${source}';`;
    }
    if (!defaultImport && importNames.length) {
        return `import {${importNames.join(', ')}} from '${source}';`;
    }
    return `import ${defaultImport}, {${importNames.join(
        ', ',
    )}} from '${source}';`;
}

export function genImportCode(imports: ImportSource[]) {
    const categorizeImports = new Map<string, ImportSource[]>();

    for (const imp of imports) {
        if (categorizeImports.has(imp.source)) {
            categorizeImports.get(imp.source).push(imp);
        } else {
            categorizeImports.set(imp.source, [imp]);
        }
    }

    const result: string[] = [];
    for (const [source, imps] of categorizeImports) {
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
