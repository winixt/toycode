import { compileSchema, Config } from '@qlin/toycode-core';
import { ModalConfig } from './type';
import { genListPageSchema } from './genPage/list';
import { createContext } from './context';

export function genListPageCode(pageConfig: ModalConfig, config: Config = {}) {
    const ctx = createContext();
    return compileSchema(genListPageSchema(ctx, pageConfig), config);
}
