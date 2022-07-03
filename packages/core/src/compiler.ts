import { compileSFC } from './sfc';
import { genJsCode } from './jsCode';
import { genGlobalCss } from './css';
import { genDependencies } from './dependencies';
import { Schema } from './type';

export function compileSchema(schema: Schema) {
    const containers = schema.componentsTree.map((item) => {
        if (item.componentName === 'SFCComponent') {
            return compileSFC(item);
        }
    });
    const result = [
        genDependencies(schema.dependencies),
        genGlobalCss(schema.css),
        ...genJsCode(schema.jsCodes),
        ...containers,
    ];

    // TODO 代码写入
    return result;
}
