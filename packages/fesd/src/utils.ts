// 跟 api-design fesjs 等强相关共享代码
import { readdirSync, lstatSync, readFileSync } from 'fs-extra';
import { JSCode } from '@qlin/toycode-core';
import { join } from 'path';
import { camelCase } from 'lodash';
import { Field, APISchema, BlockSchema, BlockMeta } from './type';
import { COMPONENTS_DIR, PAGE_DIR } from './constants';

export function isPaginationField(field: string) {
    return field === 'pagination' || field === 'page' || field === 'pager';
}

export function isReactiveSearch(params: Field[]) {
    return params.length <= 3;
}

export function genComponentName(fileName: string) {
    return fileName.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

export function genSFCFileName(fileName: string) {
    return camelCase(fileName);
}

export function hasModal(pageConfig: BlockSchema) {
    return pageConfig.relationModals?.length > 0;
}

export function genFileNameByPath(apiPath: string) {
    const splitResult = apiPath.split('/').slice(-2).join('_');
    return camelCase(splitResult);
}

export function genModalDir(blockConfig: BlockSchema) {
    if (!hasModal(blockConfig)) {
        return '';
    }
    const dirPrefix = isGenComponent(blockConfig.meta)
        ? COMPONENTS_DIR
        : PAGE_DIR;
    const fileName = genSFCFileName(blockConfig.meta.name);
    return `${dirPrefix}/${fileName}`;
}

export function isGenComponent(meta: BlockMeta) {
    return meta.type.endsWith('Component');
}

export function genDirAndFileName(blockConfig: BlockSchema) {
    const fileName = genSFCFileName(blockConfig.meta.name);
    const dirPrefix = isGenComponent(blockConfig.meta)
        ? COMPONENTS_DIR
        : PAGE_DIR;
    if (!hasModal(blockConfig)) {
        return {
            dir: dirPrefix,
            fileName: `${fileName}.vue`,
        };
    }
    return {
        dir: `${dirPrefix}/${fileName}`,
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
