import { compiler, compilerProps, compilerEvents } from '../src/compiler/index';
import { Schema } from '../src/type';

export const schema: Schema = {
    config: {
        common: {
            useDir: 'common/use',
            serviceDir: 'common/service',
            constantsPath: 'common/constants.js',
            utilsDir: 'common/utils',
        },
        pageDir: 'pages',
        componentsDir: 'components',
    },
    SFCComponent: {
        componentName: 'Page',
        fileName: 'simpleTable.vue',
        importResources: [
            {
                importName: 'FTable',
                package: '@fesjs/fes-design',
            },
        ],
        children: [
            {
                id: '1',
                componentName: 'FTable',
            },
        ],
    },
};

test('compilerProps: empty props', () => {
    expect(compilerProps()).toBe('');
    expect(compilerProps({})).toBe('');
});
