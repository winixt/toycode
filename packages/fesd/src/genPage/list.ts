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
import { genSFCFileName, getJsCode, formatPick } from '../utils';
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
                prop: item.name,
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

function genTemplate(query: APISchema) {
    const children: Component[] = [];

    if (query.params?.length) {
        children.push(genSearchForm(query.params));
    }
    children.push(genTableComponent(query.resData.fields));
    if (query.pagination) {
        children.push(genPaginationComp());
    }

    return children;
}

// *  url: string;
// *  params: object | reactiveObject,
// *  transform: function 格式化响应内容,
// *  dataField: string | 'cycle'
// *  pageField: string | 'page'
// TODO transform 的处理
function genUseTable(options: {
    url: string;
    hasSearch: boolean;
    dataField: string[];
    pagination?: string[];
}): string {
    const result: string[] = ['dataSource'];
    if (options.pagination) {
        result.push('pagination', 'changePage', 'changePageSize');
    }
    if (options.hasSearch) {
        result.push('refresh');
    }

    const functionName = options.pagination ? 'useTable' : 'useSimpleTable';

    // TODO pick 支持数组
    return `
    const { ${result.join(', ')} } = ${functionName}({
        api: '${options.url}',
        ${
            options.dataField[0] !== 'cycle'
                ? `dataField: '${options.dataField[0]}',`
                : ''
        }
        ${
            options.pagination[0] !== 'page'
                ? `pageField: '${options.pagination[0]}',`
                : ''
        }
        ${options.hasSearch ? `params: {...initSearchParams},` : ''}
    })
    `;
}

function genTableSetupCode(options: {
    url: string;
    hasSearch: boolean;
    dataField: string[];
    pagination?: string[];
}) {
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

    if (options.pagination) {
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
        content: genUseTable(options),
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

function genMappingCode(query: APISchema) {
    const importSources: ImportSource[] = [];
    const fields: Field[] = (query.resData.fields || []).concat(
        query.params || [],
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

function genAppendAllCode(query: APISchema) {
    const importSources: ImportSource[] = [];
    if (query.params.find((item) => item.appendAll)) {
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
    const queryInterface = pageConfig.query;
    const setupCodes: SetupCode[] = [
        genMappingCode(queryInterface),
        genAppendAllCode(queryInterface),
        genInitSearchParams(queryInterface.params),
        genTableSetupCode({
            url: queryInterface.url,
            hasSearch: !!queryInterface.params.length,
            dataField: queryInterface.resData.pick,
            pagination: queryInterface.pagination?.pick,
        }),
    ];

    if (queryInterface.params.length) {
        setupCodes.push(genSearchFormSetupCode(queryInterface.params));
    }

    setupCodes.push(genPageMeta(pageConfig.meta));

    return setupCodes;
}

export function genListPageSchema(pageConfig: ListPageConfig): Schema {
    formatPick(pageConfig.query, pageConfig.commonDataField);

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
                children: genTemplate(pageConfig.query),
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
