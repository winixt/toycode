import { compileSFC } from './sfc';
import { genJsCode } from './jsCode';
import { genGlobalCss } from './css';
import { genDependencies } from './dependencies';
import { Schema, Config } from './type';

export function compileSchema(schema: Schema, config?: Config) {
    const containers = schema.componentsTree.map((item) => {
        if (item.componentName === 'SFCComponent') {
            return compileSFC(item);
        }
    });
    const result = [
        genDependencies(schema.dependencies, config),
        genGlobalCss(schema.css, config),
        ...genJsCode(schema.jsCodes, config),
        ...containers,
    ];

    // TODO 代码写入
    return result;
}
