import { compilerProps } from '../src/compiler/index';
import { ExtensionType } from '../src/type';

test('empty props', () => {
    expect(compilerProps()).toBe('');
    expect(compilerProps({})).toBe('');
});

test('boolean props', () => {
    expect(
        compilerProps({
            visible: {
                type: 'boolean',
                value: true,
            },
        }),
    ).toBe('visible');

    expect(
        compilerProps({
            visible: {
                type: 'boolean',
                value: false,
            },
        }),
    ).toBe(':visible="false"');
});

test('number props', () => {
    expect(
        compilerProps({
            account: {
                type: 'number',
                value: 1,
            },
        }),
    ).toBe(':account="1"');
});

test('js expression', () => {
    expect(
        compilerProps({
            data: {
                type: ExtensionType.JSExpression,
                value: 'dataList',
            },
        }),
    ).toBe(':data="dataList"');
});

test('common prop and js expression', () => {
    expect(
        compilerProps({
            'v-model': {
                type: 'string',
                value: 'currentValue',
            },
            data: {
                type: ExtensionType.JSExpression,
                value: 'dataList',
            },
        }),
    ).toBe('v-model="currentValue" :data="dataList"');
});
