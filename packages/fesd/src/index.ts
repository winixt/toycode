import { compileSchema } from '@qlin/toycode-core';
import { genListPageSchema, ListPageConfig } from './genPage/list';

export function genListPageCode(pageConfig: ListPageConfig) {
    return compileSchema(genListPageSchema(pageConfig));
}
