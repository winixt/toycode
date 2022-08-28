import { compileSchema } from '@qlin/toycode-core';
import { ListPageConfig } from './type';
import { genListPageSchema } from './genPage/list';
import { createContext } from './context';

export function genListPageCode(pageConfig: ListPageConfig) {
    const ctx = createContext();
    return compileSchema(genListPageSchema(ctx, pageConfig));
}
