import {
    ImportType,
    ImportSource,
    Component,
    ExtensionType,
} from '@qlin/toycode-core';
import { isEmpty } from 'lodash';
import { CodeSnippet, APISchema, Field, RuleTypeEnum } from '../type';
import { componentMap } from '../componentMap';
import {
    genLabelWidth,
    handleComponentOptions,
    genImportedMappingCode,
} from './shared';
import { rulesHandler } from './rules';
import { genOptionsName } from '../utils';

export function genFormImportResources(fields: Field[]): ImportSource[] {
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

    fields.forEach((field) => {
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

    importSources.push(...genImportedMappingCode(fields));

    return importSources;
}

export function genFetchCode(fields: Field[]) {
    let fetchCode = '';
    const importSources: ImportSource[] = [];
    fields.forEach((field) => {
        if (field.apiSchema) {
            importSources.push({
                imported: 'useFetch',
                type: ImportType.ImportSpecifier,
                source: '@/common/use/useFetch',
            });

            fetchCode += `
                const {data: ${genOptionsName(field.name)} } = useFetch('${
                field.apiSchema.url
            }', {
                    defaultValue: () => [],
                    ${
                        field.apiSchema.resData.pick?.length
                            ? `pick: ${JSON.stringify(
                                  field.apiSchema.resData.pick,
                              )},`
                            : ''
                    }
                });
            `;
        }
    });

    return {
        content: fetchCode,
        importSources,
    };
}

function genSetupCode(apiSchema: APISchema) {
    const { importSources, content } = genFetchCode(apiSchema.params);
    return {
        importSources: [
            ...genFormImportResources(apiSchema.params),
            ...importSources,
        ],
        content: `
        const formRules = {
            ${genRules(apiSchema.params)}
        };
        ${content}
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
        } else if (field.apiSchema) {
            renderCompProps.options = {
                type: ExtensionType.JSExpression,
                value: `${genOptionsName(field.name)}`,
            };
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
