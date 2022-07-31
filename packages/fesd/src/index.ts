import { compileSchema } from '@qlin/toycode-core';
import { ListPageConfig } from './type';
import { genListPageSchema } from './genPage/list';

export function genListPageCode(pageConfig: ListPageConfig) {
    return compileSchema(genListPageSchema(pageConfig));
}
