import { compilerDirectives } from '../src/compiler/index';

test('empty events', () => {
    expect(compilerDirectives()).toBe('');
    expect(compilerDirectives({})).toBe('');
});

test('boolean props', () => {
    expect(
        compilerDirectives({
            'v-modle': 'currentValue',
        }),
    ).toBe('v-modle="currentValue"');

    expect(
        compilerDirectives({
            'v-modle': 'currentValue',
            'v-modle:visible': 'visible',
        }),
    ).toBe('v-modle="currentValue" v-modle:visible="visible"');
});
