import { readdirSync, lstatSync, readFileSync } from 'fs-extra';
import { JSCode } from '@qlin/toycode-core';
import { join } from 'path';
import { camelCase } from 'lodash';
import { FormField, APISchema } from './type';

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
    const files = readdirSync(dir);
    for (const file of files) {
        const filePath = join(dir, file);
        const fileStats = lstatSync(filePath);
        if (fileStats.isDirectory()) {
            getJsCode(rootDir, join(subDir, file), result);
        } else if (fileStats.isFile()) {
            result.push({
                content: readFileSync(filePath, 'utf8'),
                dir: subDir,
                fileName: file,
            });
        }
    }
    return result;
}

export function formatPick(apiDesign: APISchema, commonDataField: string) {
    if (
        apiDesign.pagination &&
        apiDesign.pagination.pick[0] === commonDataField
    ) {
        apiDesign.pagination.pick.shift();
    }
    if (apiDesign.resData && apiDesign.resData.pick[0] === commonDataField) {
        apiDesign.resData.pick.shift();
    }
}

// TODO pick 支持数组
export function getDataField(apiDesign: APISchema) {
    const dataField = apiDesign.resData.pick[0];
    if (!dataField || dataField === 'cycle') return null;

    return dataField;
}

// TODO pick 支持数组
export function getPageField(apiDesign: APISchema) {
    if (!apiDesign.pagination) return null;
    const pageField = apiDesign.pagination.pick[0];
    if (!pageField || pageField === 'page') return null;

    return pageField;
}
