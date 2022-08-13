// 跟 api-design fesjs 等强相关共享代码
import { readdirSync, lstatSync, readFileSync } from 'fs-extra';
import { JSCode } from '@qlin/toycode-core';
import { join } from 'path';
import { camelCase } from 'lodash';
import { Field, APISchema, ListPageConfig } from './type';
import { PAGE_DIR } from './constants';

export function isPaginationField(field: string) {
    return field === 'pagination' || field === 'page' || field === 'pager';
}

export function isReactiveSearch(params: Field[]) {
    return params.length <= 3;
}

export function genSFCFileName(fileName: string) {
    return camelCase(fileName);
}

export function hasModal(pageConfig: ListPageConfig) {
    return pageConfig.relationModals?.length > 0;
}

export function genModalDir(pageConfig: ListPageConfig) {
    if (!hasModal(pageConfig)) {
        return '';
    }
    const fileName = genSFCFileName(pageConfig.meta.name);
    return `${PAGE_DIR}/${fileName}`;
}

export function genPageDirAndFileName(pageConfig: ListPageConfig) {
    const fileName = genSFCFileName(pageConfig.meta.name);
    if (!hasModal(pageConfig)) {
        return {
            dir: PAGE_DIR,
            fileName: `${fileName}.vue`,
        };
    }
    return {
        dir: `${PAGE_DIR}/${fileName}`,
        fileName: 'index.vue',
    };
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

export function formatPick(apiSchema: APISchema, commonDataField: string) {
    if (
        apiSchema.pagination &&
        apiSchema.pagination.pick[0] === commonDataField
    ) {
        apiSchema.pagination.pick.shift();
    }
    if (apiSchema.resData && apiSchema.resData.pick[0] === commonDataField) {
        apiSchema.resData.pick.shift();
    }
}

// TODO pick 支持数组
export function getDataField(apiSchema: APISchema) {
    const dataField = apiSchema.resData.pick[0];
    if (!dataField || dataField === 'cycle') return null;

    return dataField;
}

// TODO pick 支持数组
export function getPageField(apiSchema: APISchema) {
    if (!apiSchema.pagination) return null;
    const pageField = apiSchema.pagination.pick[0];
    if (!pageField || pageField === 'page') return null;

    return pageField;
}
