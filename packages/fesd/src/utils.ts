import { camelCase, words } from 'lodash';
import { Field, APISchema, BlockSchema, BlockMeta } from './type';
import type { Context } from './context';

export function isPaginationField(field: string) {
    return ['pagination', 'page', 'pager', 'pageInfo', 'pageinfo'].includes(
        field,
    );
}

export function isReactiveSearch(params: Field[]) {
    return params.length <= 3;
}

export function genComponentName(fileName: string) {
    return fileName.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

export function genOptionsName(fieldName: string) {
    return `${genFetchName(fieldName)}List`;
}

export function genFetchName(fieldName: string) {
    const result = words(fieldName);
    if (/id/i.test(result[result.length - 1]) && result.length > 1) {
        return result.slice(0, result.length - 1).join('');
    }
    return result.join('');
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

export function genModalDir(ctx: Context, blockConfig: BlockSchema) {
    if (!hasModal(blockConfig)) {
        return '';
    }
    const dirPrefix = isGenComponent(blockConfig.meta)
        ? ctx.getComponentsDir()
        : ctx.getPagesDir();
    const fileName = genSFCFileName(blockConfig.meta.name);
    return `${dirPrefix}/${fileName}/components`;
}

export function isGenComponent(meta: BlockMeta) {
    return meta.type.endsWith('Component');
}

export function genDirAndFileName(ctx: Context, blockConfig: BlockSchema) {
    const fileName = genSFCFileName(blockConfig.meta.name);
    const dirPrefix = isGenComponent(blockConfig.meta)
        ? ctx.getComponentsDir()
        : ctx.getPagesDir();
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
