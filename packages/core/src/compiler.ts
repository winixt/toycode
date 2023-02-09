import { compileSFC } from './sfc';
import { genScriptCode } from './scriptCode';
import { genGlobalCss } from './css';
import { genDependencies } from './dependencies';
import type { Config, Schema } from './type';

export function compileSchema(schema: Schema, config?: Config) {
    const containers = schema.componentsTree.map((item) => {
        if (item.componentName === 'SFCComponent')
            return compileSFC(item);
        return {};
    });
    const result = [
        genDependencies(schema.dependencies, config),
        genGlobalCss(schema.css, config),
        ...genScriptCode(schema.jsCodes, config),
        ...containers,
    ];

    return result;
}
