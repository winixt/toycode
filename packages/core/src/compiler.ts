import { compileSFC } from './sfc';
import { genScriptCode } from './scriptCode';
import { genGlobalCss } from './css';
import { genDependencies } from './dependencies';
import { Schema, Config } from './type';

export function compileSchema(schema: Schema, config?: Config) {
    console.log('========== compileSchema enter!');

    const containers = schema.componentsTree.map((item) => {
        if (item.componentName === 'SFCComponent') {
            return compileSFC(item);
        }
    });
    const result = [
        genDependencies(schema.dependencies, config),
        genGlobalCss(schema.css, config),
        ...genScriptCode(schema.jsCodes, config),
        ...containers,
    ];

    return result;
}
