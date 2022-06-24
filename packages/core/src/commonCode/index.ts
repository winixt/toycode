import { join } from 'path';
import fse from 'fs-extra';
import { JSCode, PreChangeFile, ExtensionType } from '../type';
import { getSrcPath, getAbsSrcPath, genImportCode, formatCode } from '../utils';

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
        } else {
            result.push({
                file: join(getSrcPath(), filePath),
                content: formatCode(genJSFile(value)),
            });
        }
    }

    return result;
}
