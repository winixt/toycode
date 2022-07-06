import {
    Schema,
    SFCComponent,
    Component,
    ExtensionType,
    ImportType,
    ImportSource,
    SetupCode,
} from '@qlin/toycode-core';
import { APISchema, FormField, Field, PageMeta } from '../type';
import { defaultPageCss, defaultDependencies } from '../config';
import { genSFCFileName, isReactiveSearch, getJsCode } from '../utils';
import { PAGE_DIR } from '../constants';
import { join } from 'path';
import { componentMap } from '../componentMap';

interface ListPageConfig {
    meta: PageMeta;
    commonDataField: string;
    query: APISchema;
    add?: APISchema;
    modify?: APISchema;
    simpleModify?: APISchema;
    remove?: APISchema;
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
        form.children.push({
            componentName: 'FFormItem',
            props: {
                label: item.title,
            },
            // TODO
            // 1. 根据类型生成不同的 form 组件
            // 2. 合并 xxxTimeStart xxxTimeEnd 到 date-picker Range
            // 3. appendAll 的实现
            children: [
                {
                    componentName: comp.name,
                    props: {
                        placeholder: '请输入',
                        ...comp.props,
                    },
                    directives: {
                        'v-model': `searchParams.${item.name}`,
                    },
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
            change: 'change',
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
        url: '${options.url}',
        ${
            options.dataField[0] !== 'cycle'
                ? `dataField='${options.dataField[0]}',`
                : ''
        }
        ${
            options.pagination[0] !== 'page'
                ? `dataField='${options.pagination[0]}',`
                : ''
        }
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
    ];
    let watchCode = '';
    if (isReactiveSearch(params)) {
        importSources.push({
            imported: 'watch',
            type: ImportType.ImportSpecifier,
            source: 'vue',
        });

        watchCode = `
        watch(searchParams, () => {
            refresh(searchParams);
        });
        `;
    }

    const fields = params.map((item) => {
        return `${item.name}: null`;
    });

    return {
        importSources,
        content: `
        const searchParams = reactive({
            ${fields.join(', ')}
        });
        ${watchCode}
        `,
    };
}

function genSetupCode(pageConfig: ListPageConfig) {
    const queryInterface = pageConfig.query;
    const setupCodes: SetupCode[] = [
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
    const sfc: SFCComponent = {
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

    const jsCodes = getJsCode(join(__dirname, '../template', 'common'));

    return {
        componentsTree: [sfc],
        css: defaultPageCss,
        jsCodes,
        dependencies: defaultDependencies,
    };
}
