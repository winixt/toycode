import { compileSchema, Config } from '@qlin/toycode-core';
import { BlockSchema } from './type';
import { genBlockSchema } from './genPage/list';
import { Context } from './context';

export * from '@qlin/toycode-core';

// FEATURE 后续根据情况优化命名，不能以页面类型为维度
export function genListPageCode(blockSchema: BlockSchema, config: Config = {}) {
    const ctx = new Context(config);
    return compileSchema(genBlockSchema(ctx, blockSchema), config);
}
