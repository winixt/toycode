import { join } from 'path';
import fse from 'fs-extra';
import { File, Identifier } from '@babel/types';
import { parse, ParseResult } from '@babel/parser';
import {
    JSCode,
    PreChangeFile,
    ExtensionType,
    ImportSource,
    ImportType,
} from '../type';
import {
    getSrcPath,
    getAbsSrcPath,
    genImportCode,
    formatCode,
    readTextFile,
} from '../utils';

export function genCode(jsCode: JSCode): string {
    if (jsCode.type === ExtensionType.JSFunction) {
        return `export function ${jsCode.exportName}${jsCode.content}`;
    } else if (jsCode.type === ExtensionType.JSDeclaration) {
        return `export const ${jsCode.exportName} = ${jsCode.content};`;
    }
    return '';
}

export function genJSFile(jsCodes: JSCode[] = []) {
    const imports = jsCodes.reduce((acc, cur) => {
        return acc.concat(cur.importResources || []);
    }, []);
    const importCode = genImportCode(imports);
    const codes = jsCodes.map(genCode);

    return `${importCode} \n ${codes.join('\n')}`;
}

export function parseImportCode(ast: ParseResult<File>) {
    const result: ImportSource[] = [];
    for (const node of ast.program.body) {
        if (node.type === 'ImportDeclaration') {
            const source = node.source.value;
            for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportSpecifier') {
                    result.push({
                        local: specifier.local.name,
                        imported: (specifier.imported as Identifier).name,
                        source,
                        type: ImportType.ImportSpecifier,
                    });
                } else if (specifier.type === 'ImportDefaultSpecifier') {
                    result.push({
                        local: specifier.local.name,
                        source,
                        type: ImportType.ImportDefaultSpecifier,
                    });
                }
            }
        }
    }

    return result;
}

export function genJsCode(jsCodes: JSCode[] = []): PreChangeFile[] {
    const map = new Map<string, JSCode[]>();
    for (const item of jsCodes) {
        const filePath = join(item.dir, item.fileName);
        if (map.has(filePath)) {
            map.get(filePath).push(item);
        } else {
            map.set(filePath, [item]);
        }
    }

    const result: PreChangeFile[] = [];
    for (const [filePath, value] of map) {
        const absFilePath = join(getAbsSrcPath(), filePath);
        if (fse.existsSync(absFilePath)) {
            // 已有文件
            const ast = parse(readTextFile(absFilePath));
            const importsCode = parseImportCode(ast);
        } else {
            result.push({
                file: join(getSrcPath(), filePath),
                content: formatCode(genJSFile(value)),
            });
        }
    }

    return result;
}
