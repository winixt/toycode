import {
    Schema,
    SFCComponent,
    Component,
    ExtensionType,
    ImportType,
    ImportSource,
    SetupCode,
} from '@qlin/toycode-core';
import { join } from 'path';
import { APISchema, Field, ModalMeta, ModalConfig } from '../type';
import { defaultPageCss } from '../config';
import {
    genSFCFileName,
    getJsCode,
    getPageField,
    getDataField,
    genPageDirAndFileName,
} from '../utils';
import { COMMON_DIR } from '../constants';
import { componentMap } from '../componentMap';
import { handleSearchAction } from './searchAction';
import { genRelationModals } from './modal';
import { applyModal } from './useModal';
import { handleComponentOptions } from './shared';
import { Context } from '../context';

function genSearchForm(params: Field[]) {
    const form: Component = {
        componentName: 'FForm',
        props: {
            layout: 'inline',
        },
        children: [],
    };
    for (const item of params) {
        const comp = componentMap(item.component.componentName);
        const formCompProps: Record<string, any> = {
            ...item.component.props,
            ...comp.props,
        };
        let children = null;
        if (item.mappingId) {
            if (item.component.appendAll) {
                formCompProps.options = {
                    type: ExtensionType.JSExpression,
                    value: `appendAll(${item.mappingId})`,
                };
            } else {
                formCompProps.options = {
                    type: ExtensionType.JSExpression,
                    value: item.mappingId,
                };
            }
        } else if (item.options?.length) {
            children = handleComponentOptions(item.options, comp.subName);
            if (item.component.appendAll) {
                children.unshift({
                    componentName: comp.subName,
                    props: {
                        label: '全部',
                        value: null,
                    },
                });
            }
        }
        form.children.push({
            componentName: 'FFormItem',
            props: {
                label: item.title,
            },
            children: [
                {
                    componentName: comp.name,
                    props: formCompProps,
                    directives: {
                        'v-model': `searchParams.${item.name}`,
                    },
                    children,
                },
            ],
        });
    }
    return form;
}

function genTableComponent(columns: Field[]) {
    const tableComp: Component = {
        componentName: 'FTable',
        props: {
            data: {
                type: ExtensionType.JSExpression,
                value: 'dataSource',
            },
        },
        children: [],
    };
    for (const item of columns) {
        if (item.checked) {
            tableComp.children.push({
                componentName: 'FTableColumn',
                props: {
                    prop: item.alias || item.name,
                    label: item.title,
                },
            });
        }
    }
    return tableComp;
}

function genPaginationComp() {
    const paginationComp: Component = {
        componentName: 'FPagination',
        props: {
            class: 'common-page-pagination',
            currentPage: {
                type: ExtensionType.JSExpression,
                value: 'pagination.currentPage',
            },
            totalCount: {
                type: ExtensionType.JSExpression,
                value: 'pagination.totalCount',
            },
            pageSize: {
                type: ExtensionType.JSExpression,
                value: 'pagination.pageSize',
            },
            showSizeChanger: true,
            showTotal: true,
        },
        events: {
            change: 'changePage',
            pageSizeChange: 'changePageSize',
        },
        directives: {
            'v-if': 'pagination.totalCount > 0',
        },
    };

    return paginationComp;
}

function genTemplate(apiSchema: APISchema) {
    const children: Component[] = [];

    if (apiSchema.params?.length) {
        children.push(genSearchForm(apiSchema.params));
    }
    children.push(genTableComponent(apiSchema.resData.fields));
    if (apiSchema.pagination) {
        children.push(genPaginationComp());
    }

    return children;
}

function genTransform(apiSchema: APISchema) {
    const code = apiSchema.resData.fields
        .map((item) => {
            if (item.mappingId) {
                return `item.${item.alias} = getTargetLabel(${item.mappingId}, item.${item.name})`;
            }
            return null;
        })
        .filter(Boolean);
    if (code.length) {
        return {
            importSources: [
                {
                    imported: 'getTargetLabel',
                    type: ImportType.ImportSpecifier,
                    source: '@/common/utils',
                },
            ],
            content: `transform(data) {
                return data.map((item) => {
                    ${code.join(';\n')}
                    return item;
                })
            },`,
        };
    }
    return {
        importSources: [],
        content: '',
    };
}

// FEATURE 没想明白以后 formatParams 还有那些形式，以后遇到再对这块代码进行优化
function genFormatParams(ctx: Context, apiSchema: APISchema) {
    const targetField = apiSchema.params.find((item) => !!item.mapFields);
    if (targetField) {
        ctx.dependence.addPackage({
            package: 'date-fns',
            version: '2.29.2',
        });

        const format =
            targetField.component.props.type === 'daterangetime'
                ? 'yyyy-MM-dd HH:mm:ss'
                : 'yyyy-MM-dd';
        return {
            importSources: [
                {
                    imported: 'format',
                    type: ImportType.ImportSpecifier,
                    source: 'date-fns',
                },
            ],
            content: `
            formatParams(params) {
                if (params.${targetField.name}) {
                    const rawData = params.${targetField.name};
                    delete params.${targetField.name};
                    params.${targetField.mapFields[0]} = format(rawData[0], '${format}');
                    params.${targetField.mapFields[1]} = format(rawData[1], '${format}');
                }
    
                return params;
            }
            `,
        };
    }
    return {
        importSources: [],
        content: '',
    };
}

function genUseTable(ctx: Context, pageConfig: ModalConfig) {
    const importSources: ImportSource[] = [];
    const apiSchema = pageConfig.apiSchema;
    const result: string[] = ['dataSource'];
    if (apiSchema.pagination) {
        result.push('pagination', 'changePage', 'changePageSize');
    }
    if (apiSchema.params.length || pageConfig.relationModals.length) {
        result.push('refresh');
    }

    const functionName = apiSchema.pagination ? 'useTable' : 'useSimpleTable';
    const dataField = getDataField(apiSchema);
    const pageField = getPageField(apiSchema);

    if (apiSchema.pagination) {
        importSources.push({
            imported: 'FPagination',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes-design',
        });
    }

    importSources.push({
        imported: functionName,
        type: ImportType.ImportSpecifier,
        source: '@/common/use/useTable',
    });

    const transformCode = genTransform(apiSchema);
    const formatCode = genFormatParams(ctx, apiSchema);

    return {
        importSources: [
            ...importSources,
            ...transformCode.importSources,
            ...formatCode.importSources,
        ],
        content: `
        const { ${result.join(', ')} } = ${functionName}({
            api: '${apiSchema.url}',
            ${dataField ? `dataField: '${dataField}',` : ''}
            ${pageField ? `pageField: '${pageField}',` : ''}
            ${apiSchema.params.length ? `params: {...initSearchParams},` : ''}
            ${formatCode.content}
            ${transformCode.content}
        })
        `,
    };
}

function genTableSetupCode(ctx: Context, pageConfig: ModalConfig) {
    const importSources: ImportSource[] = [
        {
            imported: 'FTable',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes-design',
        },
        {
            imported: 'FTableColumn',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes-design',
        },
    ];

    const table = genUseTable(ctx, pageConfig);

    return {
        importSources: [...importSources, ...table.importSources],
        content: table.content,
    };
}

function genModalMeta(meta: ModalMeta) {
    const importSources: ImportSource[] = [
        {
            imported: 'defineRouteMeta',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes',
        },
    ];

    return {
        importSources,
        content: `
        defineRouteMeta({
            name: '${genSFCFileName(meta.name)}',
            title: '${meta.title}',
        });
        `,
    };
}

function genSearchFormSetupCode(params: Field[]): SetupCode {
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
    for (const item of params) {
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

    return {
        importSources,
        content: `
        const searchParams = reactive({
            ...initSearchParams
        });
        `,
    };
}

function genMappingCode(apiSchema: APISchema) {
    const importSources: ImportSource[] = [];
    const fields: Field[] = (apiSchema.resData.fields || []).concat(
        apiSchema.params || [],
    );
    fields.forEach((item) => {
        if (item.mappingId) {
            importSources.push({
                imported: item.mappingId,
                type: ImportType.ImportSpecifier,
                source: '@/common/constants',
            });
        }
    });

    return {
        importSources,
        content: '',
    };
}

function genAppendAllCode(apiSchema: APISchema) {
    const importSources: ImportSource[] = [];
    if (apiSchema.params.find((item) => item.component.appendAll)) {
        importSources.push({
            imported: 'appendAll',
            type: ImportType.ImportSpecifier,
            source: '@/common/utils',
        });
    }

    return {
        importSources,
        content: '',
    };
}

function genInitSearchParams(params: Field[]): SetupCode {
    let content = '';
    if (params.length) {
        const fields = params.map((item) => {
            return `${item.name}: null`;
        });
        content = `
        const initSearchParams = {
            ${fields.join(', ')}
        }
        `;
    }
    return {
        importSources: [],
        content,
    };
}

function genSetupCode(ctx: Context, pageConfig: ModalConfig) {
    const queryApiSchema = pageConfig.apiSchema;
    const setupCodes: SetupCode[] = [
        genMappingCode(queryApiSchema),
        genAppendAllCode(queryApiSchema),
        genInitSearchParams(queryApiSchema.params),
        genTableSetupCode(ctx, pageConfig),
    ];

    if (queryApiSchema.params.length) {
        setupCodes.push(genSearchFormSetupCode(queryApiSchema.params));
    }

    setupCodes.push(genModalMeta(pageConfig.meta));

    return setupCodes;
}

function formatResData(apiSchema: APISchema) {
    apiSchema.resData.fields = apiSchema.resData.fields.map((item) => {
        return {
            alias: item.mappingId ? `${item.name}Text` : null,
            ...item,
        };
    });
}

export function genListPageSchema(
    ctx: Context,
    pageConfig: ModalConfig,
): Schema {
    formatResData(pageConfig.apiSchema);

    const initSFC: SFCComponent = {
        componentName: 'SFCComponent',
        ...genPageDirAndFileName(pageConfig),
        setupCodes: genSetupCode(ctx, pageConfig),
        children: [
            {
                componentName: 'div',
                props: {
                    class: 'common-page',
                },
                children: genTemplate(pageConfig.apiSchema),
            },
        ],
    };

    const sfc = [handleSearchAction, applyModal].reduce((acc, action) => {
        return action(pageConfig, acc);
    }, initSFC);

    const jsCodes = getJsCode(join(__dirname, '../../template'), COMMON_DIR);

    return {
        componentsTree: [sfc, ...genRelationModals(pageConfig)],
        css: defaultPageCss,
        jsCodes,
        dependencies: ctx.dependence.getPackages(),
    };
}
