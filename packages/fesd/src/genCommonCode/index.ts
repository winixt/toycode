// 跟 api-design fesjs 等强相关共享代码
import { readdirSync, readFileSync } from 'fs-extra';
import { JSCode } from '@qlin/toycode-core';
import { join, dirname, basename } from 'path';
import { Context } from '../context';

function getUtilsCode(ctx: Context, rootDir: string): JSCode {
    return {
        content: readFileSync(join(rootDir, 'utils.js'), 'utf-8'),
        dir: dirname(ctx.getUtilsFilePath()),
        fileName: basename(ctx.getUtilsFilePath()),
    };
}

function getUseCode(ctx: Context, rootDir: string): JSCode[] {
    const useDir = join(rootDir, 'use');
    const files = readdirSync(useDir);
    return files.map((file) => {
        return {
            content: readFileSync(join(useDir, file), 'utf8'),
            ...ctx.getUseDirAndFileName(file),
        };
    });
}

export function getCommonJsCode(ctx: Context) {
    const rootDir = join(__dirname, '../../template/common');
    return getUseCode(ctx, rootDir).concat(getUtilsCode(ctx, rootDir));
}
