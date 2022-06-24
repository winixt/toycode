import { join } from 'path';
import fse from 'fs-extra';
import postcss, { Rule } from 'postcss';
import {
    getSrcPath,
    getAbsSrcPath,
    getFileName,
    readTextFile,
    formatCode,
} from '../utils';
import { CSS, PreChangeFile } from '../type';

export function genGlobalCss(css: CSS): PreChangeFile {
    if (!css.content) return;

    const fileName = getFileName(css.fileName, `.${css.lang}`);
    const cssPath = join(getAbsSrcPath(), fileName);

    if (fse.existsSync(cssPath)) {
        const oldCssAST = postcss.parse(readTextFile(cssPath));
        const currentCssAST = postcss.parse(css.content);

        const topLevelNodes = [];
        const hasInjectSelectors = new Set<string>();
        for (const rule of oldCssAST.nodes) {
            const newRule = currentCssAST.nodes.find(
                (item) =>
                    (item as Rule).selector &&
                    (item as Rule).selector === (rule as Rule).selector,
            );
            if (newRule) {
                hasInjectSelectors.add((newRule as Rule).selector);
                topLevelNodes.push(newRule);
            } else {
                topLevelNodes.push(rule);
            }
        }

        for (const rule of currentCssAST.nodes) {
            if (!hasInjectSelectors.has((rule as Rule).selector)) {
                topLevelNodes.push(rule);
            }
        }

        oldCssAST.nodes = topLevelNodes;
        return {
            file: join(getSrcPath(), fileName),
            content: formatCode(oldCssAST.toResult().css, 'css'),
        };
    }
    return {
        file: join(getSrcPath(), fileName),
        content: formatCode(css.content, 'css'),
    };
}
