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
import {
    APISchema,
    FormField,
    Option,
    Field,
    PageMeta,
    ListPageConfig,
} from '../type';
import { defaultPageCss, defaultDependencies } from '../config';
import {
    genSFCFileName,
    getJsCode,
    formatPick,
    getPageField,
    getDataField,
} from '../utils';
import { PAGE_DIR, COMMON_DIR } from '../constants';
import { componentMap } from '../componentMap';
import { handleSearchAction } from './searchAction';

function handleComponentOptions(options: Option[], componentName: string) {
    return options.map((option) => {
        return {
            componentName,
            props: {
                label: option.label,
                value: option.value,
            },
        };
    });
}

function genSearchForm(params: FormField[]) {
    const form: Component = {
        componentName: 'FForm',
        props: {
            layout: 'inline',
        },
        children: [],
    };
    for (const item of params) {
        const comp = componentMap(item.componentName);
        const formCompProps: Record<string, any> = {
            ...item.props,
            ...comp.props,
        };
        let children = null;
        if (item.mappingId) {
            if (item.appendAll) {
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
            if (item.appendAll) {
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
            // TODO
            // 合并 xxxTimeStart xxxTimeEnd 到 date-picker Range
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
    // TODO table slots
    for (const item of columns) {
        tableComp.children.push({
            componentName: 'FTableColumn',
            props: {
                prop: item.alias || item.name,
                label: item.title,
            },
        });
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
        return `transform(data) {
            return data.map((item) => {
                ${code.join(';\n')}
                return item;
            })
        },`;
    }
    return '';
}

function genUseTable(query: APISchema): string {
    const result: string[] = ['dataSource'];
    if (query.pagination) {
        result.push('pagination', 'changePage', 'changePageSize');
    }
    if (query.params.length) {
        result.push('refresh');
    }

    const functionName = query.pagination ? 'useTable' : 'useSimpleTable';
    const dataField = getDataField(query);
    const pageField = getPageField(query);

    return `
    const { ${result.join(', ')} } = ${functionName}({
        api: '${query.url}',
        ${dataField ? `dataField: '${dataField}',` : ''}
        ${pageField ? `pageField: '${pageField}',` : ''}
        ${query.params.length ? `params: {...initSearchParams},` : ''}
        ${genTransform(query)}
    })
    `;
}

function genTableSetupCode(query: APISchema) {
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

    if (query.resData.fields.find((field) => field.mappingId)) {
        importSources.push({
            imported: 'getTargetLabel',
            type: ImportType.ImportSpecifier,
            source: '@/common/utils',
        });
    }

    if (query.pagination) {
        importSources.push({
            imported: 'FPagination',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes-design',
        });
        importSources.push({
            imported: 'useTable',
            type: ImportType.ImportSpecifier,
            source: '@/common/use/useTable',
        });
    } else {
        importSources.push({
            imported: 'useSimpleTable',
            type: ImportType.ImportSpecifier,
            source: '@/common/use/useTable',
        });
    }

    return {
        importSources,
        content: genUseTable(query),
    };
}

function genPageMeta(meta: PageMeta) {
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

function genSearchFormSetupCode(params: FormField[]): SetupCode {
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
        const comp = componentMap(item.componentName);
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
    if (apiSchema.params.find((item) => item.appendAll)) {
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

function genInitSearchParams(params: FormField[]): SetupCode {
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

function genSetupCode(pageConfig: ListPageConfig) {
    const queryApiSchema = pageConfig.apiSchema;
    const setupCodes: SetupCode[] = [
        genMappingCode(queryApiSchema),
        genAppendAllCode(queryApiSchema),
        genInitSearchParams(queryApiSchema.params),
        genTableSetupCode(queryApiSchema),
    ];

    if (queryApiSchema.params.length) {
        setupCodes.push(genSearchFormSetupCode(queryApiSchema.params));
    }

    setupCodes.push(genPageMeta(pageConfig.meta));

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

export function genListPageSchema(pageConfig: ListPageConfig): Schema {
    formatResData(pageConfig.apiSchema);
    formatPick(pageConfig.apiSchema, pageConfig.commonDataField);

    const initSFC: SFCComponent = {
        componentName: 'SFCComponent',
        dir: PAGE_DIR,
        fileName: `${genSFCFileName(pageConfig.meta.name)}.vue`,
        setupCodes: genSetupCode(pageConfig),
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

    const sfc = [handleSearchAction].reduce((acc, action) => {
        return action(pageConfig, acc);
    }, initSFC);

    const jsCodes = getJsCode(join(__dirname, '../../template'), COMMON_DIR);

    return {
        componentsTree: [sfc],
        css: defaultPageCss,
        jsCodes,
        dependencies: defaultDependencies,
    };
}
