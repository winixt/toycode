import { ImportType, ImportSource, ExtensionType } from '@qlin/toycode-core';
import { CodeSnippet, APISchema } from '../type';
import { componentMap } from '../componentMap';
import { genLabelWidth } from './shared';

function genImportResources(apiSchema: APISchema): ImportSource[] {
    const importSources: ImportSource[] = [
        {
            imported: 'reactive',
            type: ImportType.ImportSpecifier,
            source: 'vue',
        },
        {
            imported: 'FForm',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes-design',
        },
        {
            imported: 'FFormItem',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes-design',
        },
    ];
    for (const item of apiSchema.params) {
        const comp = componentMap(item.component.componentName);
        importSources.push({
            imported: comp.name,
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes-design',
        });
        if (comp.subName) {
            importSources.push({
                imported: comp.subName,
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            });
        }
    }

    return importSources;
}

function genSetupCode(apiSchema: APISchema) {
    // TODO form 校验
    return {
        importSources: genImportResources(apiSchema),
        content: `
        const formRules = [];
        `,
    };
}

export function genFormCodeSnippet(
    apiSchema: APISchema,
    parentId: string,
): CodeSnippet {
    return {
        setup: genSetupCode(apiSchema),
        component: {
            parentId,
            componentName: 'FForm',
            props: {
                ref: 'formRefEl',
                rules: {
                    value: 'formRules',
                    type: ExtensionType.JSExpression,
                },
                model: {
                    value: 'formModel',
                    type: ExtensionType.JSExpression,
                },
                labelWidth: genLabelWidth(apiSchema.params),
            },
        },
    };
}
