import { compileSchema, Config } from '@qlin/toycode-core';
import { ListPageConfig } from './type';
import { genListPageSchema } from './genPage/list';
import { createContext } from './context';

export function genListPageCode(
    pageConfig: ListPageConfig,
    config: Config = {},
) {
    const ctx = createContext();
    return compileSchema(genListPageSchema(ctx, pageConfig), config);
}
