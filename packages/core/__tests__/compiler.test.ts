import { compiler } from '../src/compiler/index';
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
};

test('adds 1 + 2 to equal 3', () => {
    expect(compiler(schema)).toBe('');
});
