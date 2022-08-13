import {
    ImportType,
    ImportSource,
    Component,
    ExtensionType,
} from '@qlin/toycode-core';
import { isEmpty } from 'lodash';
import { CodeSnippet, APISchema, Field, RuleTypeEnum } from '../type';
import { componentMap } from '../componentMap';
import { genLabelWidth, handleComponentOptions } from './shared';
import { rulesHandler } from './rules';

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

    apiSchema.params.forEach((field) => {
        const comp = componentMap(field.component.componentName);
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
    });

    apiSchema.params.forEach((field) => {
        if (field.mappingId) {
            importSources.push({
                imported: field.mappingId,
                type: ImportType.ImportSpecifier,
                source: '@/common/constants',
            });
        }
    });

    return importSources;
}

function genSetupCode(apiSchema: APISchema) {
    return {
        importSources: genImportResources(apiSchema),
        content: `
        const formRules = {
            ${genRules(apiSchema.params)}
        };
        `,
    };
}

function genRules(fields: Field[]) {
    return fields
        .filter((field: Field) => {
            return field.component.required || !isEmpty(field.component.rules);
        })
        .map((field) => {
            const rules = field.component.rules || [];
            if (
                field.component.required &&
                !rules.find((rule) => rule.type === 'required')
            ) {
                rules.push({
                    type: RuleTypeEnum.required,
                });
            }
            return `
        ${field.name}: [
           ${rules
               .map((rule) => {
                   return rulesHandler[rule.type](rule, field.type);
               })
               .join(',')} 
        ]
        `;
        })
        .join(',');
}

function genFormItems(fields: Field[]): Component[] {
    return fields.map((field) => {
        const comp = componentMap(field.component.componentName);
        const renderCompProps: Record<string, any> = {
            ...field.component.props,
            ...comp.props,
        };
        let children = null;
        if (field.mappingId) {
            renderCompProps.options = {
                type: ExtensionType.JSExpression,
                value: field.mappingId,
            };
        } else if (field.options?.length) {
            children = handleComponentOptions(field.options, comp.subName);
        }

        return {
            componentName: 'FFormItem',
            props: {
                label: field.title,
                prop: field.name,
            },
            children: [
                {
                    componentName: comp.name,
                    props: renderCompProps,
                    directives: {
                        'v-model': `formModel.${field.name}`,
                    },
                    children,
                },
            ],
        };
    });
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
            children: genFormItems(apiSchema.params),
        },
    };
}
