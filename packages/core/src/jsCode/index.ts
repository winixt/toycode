import { join } from 'path';
import fse from 'fs-extra';
import { File, Identifier, VariableDeclaration, Statement } from '@babel/types';
import generate from '@babel/generator';
import { parse, ParseResult } from '@babel/parser';
import { JSCode, PreChangeFile, ImportSource, ImportType } from '../type';
import {
    getSrcPath,
    getAbsSrcPath,
    genImportCode,
    formatCode,
    readTextFile,
} from '../utils';

function getAST(code: string) {
    return parse(code, {
        sourceType: 'module',
    });
}

function parseImportCode(ast: ParseResult<File>) {
    const result: ImportSource[] = [];
    for (const node of ast.program.body) {
        if (node.type === 'ImportDeclaration') {
            const source = node.source.value;
            for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportSpecifier') {
                    result.push({
                        local: specifier.local.name,
                        imported: (specifier.imported as Identifier).name,
                        source,
                        type: ImportType.ImportSpecifier,
                    });
                } else if (specifier.type === 'ImportDefaultSpecifier') {
                    result.push({
                        local: specifier.local.name,
                        source,
                        type: ImportType.ImportDefaultSpecifier,
                    });
                }
            }
        }
    }

    return result;
}

export function removeImportCode(ast: ParseResult<File>) {
    ast.program.body = ast.program.body.filter(
        (item) => item.type !== 'ImportDeclaration',
    );
    return ast;
}

export function parsetJsCodes(jsCodes: JSCode[] = []) {
    const codesAst = jsCodes.map((jsCode) => {
        return getAST(jsCode.content);
    });
    const imports = codesAst.reduce((acc, ast) => {
        return acc.concat(parseImportCode(ast));
    }, []);
    const importCodes = genImportCode(imports);
    const codes = codesAst.map((ast) => {
        return generate(removeImportCode(ast)).code;
    });

    return {
        importCodes,
        codes,
    };
}

export function genJSFile(jsCodes: JSCode[] = []) {
    const { importCodes, codes } = parsetJsCodes(jsCodes);

    return `${importCodes} \n ${codes.join('\n')}`;
}

function getVariableDeclarationNames(vd: VariableDeclaration) {
    const result: string[] = [];
    for (const declaration of vd.declarations) {
        if (declaration.type === 'VariableDeclarator') {
            result.push((declaration.id as Identifier).name);
        }
    }
    if (result.length > 1) {
        console.warn('不能同时声明多个变量', result.join('\n'));
    }

    return result[0];
}

export function getTopLevelDeclarations(ast: ParseResult<File>) {
    const result: {
        declaration: string;
        node: Statement;
    }[] = [];
    for (const node of ast.program.body) {
        if (node.type === 'VariableDeclaration') {
            result.push({
                declaration: getVariableDeclarationNames(node),
                node,
            });
        } else if (node.type === 'FunctionDeclaration') {
            result.push({
                declaration: node.id.name,
                node,
            });
        } else if (node.type === 'ExportNamedDeclaration') {
            if (node.declaration.type === 'FunctionDeclaration') {
                result.push({
                    declaration: node.declaration.id.name,
                    node,
                });
            } else if (node.declaration.type === 'VariableDeclaration') {
                result.push({
                    declaration: getVariableDeclarationNames(node.declaration),
                    node,
                });
            }
        }
    }

    return result;
}

function getJsCodeDeclaration(jsCodes: JSCode[]) {
    return jsCodes.map((jsCode) => {
        const declarations = getTopLevelDeclarations(getAST(jsCode.content));
        return {
            declarations,
            jsCode,
        };
    });
}

export function genJsCode(jsCodes: JSCode[] = []): PreChangeFile[] {
    const map = new Map<string, JSCode[]>();
    for (const item of jsCodes) {
        const filePath = join(item.dir, item.fileName);
        if (map.has(filePath)) {
            map.get(filePath).push(item);
        } else {
            map.set(filePath, [item]);
        }
    }

    const result: PreChangeFile[] = [];
    for (const [filePath, value] of map) {
        const absFilePath = join(getAbsSrcPath(), filePath);
        if (fse.existsSync(absFilePath)) {
            // 已有文件
            const ast = getAST(readTextFile(absFilePath));
            const jsCodeDeclaration = getJsCodeDeclaration(value);

            const importCodes = parseImportCode(ast);
            const topLevelDeclarations = getTopLevelDeclarations(ast);

            let jsCodeImportCode: ImportSource[] = [];
            const newStatements: Statement[] = [];
            for (const declaration of jsCodeDeclaration) {
                let hasNewCode = false;
                for (const item of declaration.declarations) {
                    if (
                        !topLevelDeclarations.find(
                            (d) => d.declaration === item.declaration,
                        )
                    ) {
                        hasNewCode = true;
                        newStatements.push(item.node);
                    }
                }
                if (hasNewCode) {
                    // TODO 如果一个 jscode 代码片段存在多个声明函数，有可能导致 import 进不需要的 变量
                    jsCodeImportCode = jsCodeImportCode.concat(
                        parseImportCode(getAST(declaration.jsCode.content)),
                    );
                }
            }

            if (newStatements.length) {
                const importCode = genImportCode(
                    importCodes.concat(jsCodeImportCode),
                );
                removeImportCode(ast);
                ast.program.body.push(...newStatements);

                result.push({
                    file: join(getSrcPath(), filePath),
                    content: formatCode(
                        `${importCode} \n ${generate(ast).code}`,
                    ),
                });
            }
        } else {
            result.push({
                file: join(getSrcPath(), filePath),
                content: formatCode(genJSFile(value)),
            });
        }
    }

    return result;
}
