export * from './type';
export * from './compiler';
export { genComponentId } from './utils';
export { astToCode, getAST, getTopLevelDeclarations } from './scriptCode/index';

/**
 * TODO
 * 对于生成的 共享代码
 * 有可能被后续的 adaptor 修改
 * 有可能在生成之后，被开发修改
 *
 * 第一期逻辑：判断之前有无导出相同的值，有则直接忽略
 * （这会导致 adaptor 的更新无法覆盖之前生成的代码，后续计划通过语法分析 + code diff 让开发选择覆盖方式）
 */
