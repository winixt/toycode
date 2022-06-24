import { join, extname } from 'path';
import prettier from 'prettier';
import fse from 'fs-extra';

export function getProjectPath() {
    return process.cwd();
}

export function getSrcPath() {
    return 'src';
}

export function getAbsSrcPath() {
    return join(getProjectPath(), 'src');
}

export function getFileName(fileName: string, ext: string) {
    if (extname(fileName) === ext) {
        return fileName;
    }
    return fileName + ext;
}

export function readTextFile(filePath: string) {
    return fse.readFileSync(filePath, 'utf-8');
}

// TODO 自定义格式化代码
export const formatCode = (code: string, parser?: string) => {
    return prettier.format(code, {
        parser: parser ?? 'babel',
        semi: true,
        trailingComma: 'all',
        singleQuote: true,
        tabWidth: 4,
        useTabs: false,
        printWidth: 160,
    });
};
