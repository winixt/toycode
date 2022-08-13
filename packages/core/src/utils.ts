import { join, extname } from 'path';
import { format } from 'prettier';
import { readFileSync } from 'fs-extra';
import { nanoid } from 'nanoid';
import { ImportSource, ImportType } from './type';

export function getProjectPath(projectDir?: string) {
    return projectDir || process.cwd();
}

export function getSrcPath() {
    return 'src';
}

export function getAbsSrcPath(projectDir?: string) {
    return join(getProjectPath(projectDir), 'src');
}

export function getFileName(fileName: string, ext: string) {
    if (extname(fileName) === ext) {
        return fileName;
    }
    return fileName + ext;
}

export function readTextFile(filePath: string) {
    return readFileSync(filePath, 'utf-8');
}

export function genSingleImport(imports: ImportSource[]) {
    if (!imports.length) return '';
    const source = imports[0].source;
    const importNames = new Set<string>();
    let defaultImport: string;
    for (const imp of imports) {
        if (imp.type === ImportType.ImportDefaultSpecifier) {
            defaultImport = imp.local || imp.imported;
        } else if (imp.local && imp.local !== imp.imported) {
            importNames.add(`${imp.imported} as ${imp.local}`);
        } else {
            importNames.add(imp.imported);
        }
    }

    if (defaultImport && importNames.size) {
        return `import ${defaultImport}} from '${source}';`;
    }
    if (!defaultImport && importNames.size) {
        return `import {${Array.from(importNames).join(
            ', ',
        )}} from '${source}';`;
    }
    return `import ${defaultImport}, {${Array.from(importNames).join(
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
    for (const imps of categorizeImports.values()) {
        result.push(genSingleImport(imps));
    }

    return result.join('\n');
}

// TODO 自定义格式化代码
export const formatCode = (code: string, parser?: string) => {
    return format(code, {
        parser: parser ?? 'babel',
        semi: true,
        trailingComma: 'all',
        singleQuote: true,
        tabWidth: 4,
        useTabs: false,
        printWidth: 160,
    });
};

export const genComponentId = () => {
    return 'node_' + nanoid(10);
};
