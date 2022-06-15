import { compilerEvents } from '../src/compiler/index';

test('empty events', () => {
    expect(compilerEvents()).toBe('');
    expect(compilerEvents({})).toBe('');
});

test('boolean props', () => {
    expect(
        compilerEvents({
            click: 'onClick',
        }),
    ).toBe('@click="onClick"');

    expect(
        compilerEvents({
            click: 'onClick',
            change: 'onChange',
        }),
    ).toBe('@click="onClick" @change="onChange"');
});
