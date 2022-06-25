import { parse } from '@babel/parser';
import generate from '@babel/generator';

export function parseJS(code: string) {
    return parse(code, {
        sourceType: 'unambiguous',
    });
}
