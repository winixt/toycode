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
import { Context } from '../context';

export function genFormImportResources(
    ctx: Context,
    fields: Field[],
): ImportSource[] {
    const importSources: ImportSource[] = [
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
        if (comp.name === 'FSelect' && field.options?.length) {
            importSources.push({
                imported: comp.subName,
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            });
        } else if (comp.name !== 'FSelect' && comp.subName) {
            importSources.push({
                imported: comp.subName,
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes-design',
            });
        }
    });

    importSources.push(...genImportedMappingCode(ctx, fields));

    return importSources;
}

export function genFetchCode(ctx: Context, fields: Field[]) {
    let fetchCode = '';
    const importSources: ImportSource[] = [];
    fields.forEach((field) => {
        if (field.apiSchema) {
            const relateParams = fields.filter((item) => {
                return (field.apiSchema.params || []).find(
                    (param) => param.name === item.name,
                );
            });

            if (!relateParams.length) {
                importSources.push({
                    imported: 'useFetch',
                    type: ImportType.ImportSpecifier,
                    source: ctx.getUseFetchImp(),
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
            } else {
                importSources.push({
                    imported: 'request',
                    type: ImportType.ImportSpecifier,
                    source: '@fesjs/fes',
                });
                importSources.push({
                    imported: 'ref',
                    type: ImportType.ImportSpecifier,
                    source: 'vue',
                });
                importSources.push({
                    imported: 'watch',
                    type: ImportType.ImportSpecifier,
                    source: 'vue',
                });
                const relateParamsValues = relateParams.map((item) => {
                    return `searchParams.${item.name}`;
                });
                fetchCode += `
                const ${genOptionsName(field.name)} = ref([]);
                watch(() => [${relateParamsValues.join(', ')}], async () => {
                    searchParams.${field.name} = null;
                    ${genOptionsName(field.name)}.value = [];
                    if (${relateParamsValues.join(' != null && ')} != null) {
                        const result = await request('${field.apiSchema.url}', {
                            ${relateParamsValues
                                .map((item) => {
                                    return `${item.split('.')[1]}: ${item}`;
                                })
                                .join(',')}
                        });
                        ${genOptionsName(field.name)}.value = ${
                    field.apiSchema.resData.pick
                        ? `result.${field.apiSchema.resData.pick[0]}`
                        : 'result'
                }
                        
                    }
                }, {
                    immediate: true
                });
                `;
            }
        }
    });

    return {
        content: fetchCode,
        importSources,
    };
}

function genSetupCode(ctx: Context, apiSchema: APISchema) {
    const { importSources, content } = genFetchCode(ctx, apiSchema.params);
    return {
        importSources: [
            ...genFormImportResources(ctx, apiSchema.params),
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
    ctx: Context,
    apiSchema: APISchema,
    parentId: string,
): CodeSnippet {
    return {
        setup: genSetupCode(ctx, apiSchema),
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
