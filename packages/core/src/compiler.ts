import { compileSFC } from './sfc';
import { genJsCode } from './jsCode';
import { genGlobalCss } from './css';
import { genDependencies } from './dependencies';
import { Schema } from './type';

export function compileSchema(schema: Schema) {
    const result = [
        genDependencies(schema.dependencies),
        genGlobalCss(schema.css),
        ...genJsCode(schema.jsCodes),
        ...schema.sfc.map(compileSFC),
    ];

    // TODO 代码写入
    return result;
}
