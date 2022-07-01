import fse from 'fs-extra';
import { JSCode } from '@qlin/toycode-core';
import { join } from 'path';
import { camelCase } from 'lodash-es';
import { FormField } from './type';

export function isPaginationField(field: string) {
    return field === 'pagination' || field === 'page' || field === 'pager';
}

export function isReactiveSearch(params: FormField[]) {
    return params.length <= 3;
}

export function genSFCFileName(fileName: string) {
    return camelCase(fileName);
}

export function getJsCode(rootDir: string, subDir = '', result: JSCode[] = []) {
    const dir = join(rootDir, subDir);
    const files = fse.readdirSync(join(rootDir, subDir));
    for (const file of files) {
        const filePath = join(dir, file);
        const fileStats = fse.lstatSync(filePath);
        if (fileStats.isDirectory()) {
            getJsCode(rootDir, join(subDir, file), result);
        } else if (fileStats.isFile()) {
            result.push({
                content: fse.readFileSync(filePath, 'utf8'),
                dir: subDir,
                fileName: file,
            });
        }
    }
    return result;
}
