import {
    Schema,
    SFCComponent,
    Component,
    ExtensionType,
    ImportType,
    ImportSource,
    SetupCode,
} from '@qlin/toycode-core';
import { JSONSchema7 } from 'json-schema';
import { APISchema, PageMeta } from '../type';
import { defaultPageCss, defaultDependencies } from '../config';
import {
    hasSearch,
    findPaginationSchema,
    findTableDataSchema,
    findPaginationField,
    findTableDataField,
    genSFCFileName,
    isReactiveSearch,
    getJsCode,
} from '../utils';
import { PAGE_DIR } from '../constants';
import { join } from 'path';

interface ListPageConfig {
    meta: PageMeta;
    commonDataField: string;
    query: APISchema;
    add?: APISchema;
    modify?: APISchema;
    simpleModify?: APISchema;
    remove?: APISchema;
}

export function genSearchForm(requestBody: JSONSchema7) {
    const tableComp: Component = {
        componentName: 'FForm',
        props: {
            layout: {
                type: 'string',
                value: 'inline',
            },
        },
        children: [],
    };
    for (const key in requestBody.properties) {
        const item = requestBody.properties[key] as any;
        tableComp.children.push({
            componentName: 'FFormItem',
            props: {
                label: {
                    type: 'string',
                    value: item.title,
                },
            },
            // TODO 根据类型生成不同的 form 组件
            children: [
                {
                    componentName: 'FInput',
                    props: {
                        placeholder: {
                            type: 'string',
                            value: '请输入',
                        },
                    },
                    directives: {
                        'v-model': `searchParams.${key}`,
                    },
                },
            ],
        });
    }
    return tableComp;
}

export function genTableComponent(tableDataSchema: JSONSchema7) {
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
    for (const key in (tableDataSchema.items as JSONSchema7).properties) {
        const item = (tableDataSchema.items as JSONSchema7).properties[
            key
        ] as any;
        tableComp.children.push({
            componentName: 'FTableColumn',
            props: {
                prop: {
                    type: 'string',
                    value: key,
                },
                label: {
                    type: 'string',
                    value: item.title,
                },
            },
        });
    }
    return tableComp;
}

export function genPaginationComp() {
    const paginationComp: Component = {
        componentName: 'FPagination',
        props: {
            class: {
                type: 'string',
                value: 'common-page-pagination',
            },
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
            showSizeChanger: {
                type: 'boolean',
                value: true,
            },
            showTotal: {
                type: 'boolean',
                value: true,
            },
        },
        events: {
            change: 'change',
            pageSizeChange: 'changePageSize',
        },
    };

    return paginationComp;
}

function genTemplate(query: APISchema) {
    const paginationSchema = findPaginationSchema(query.responseBody);
    const tableDataSchema = findTableDataSchema(query.responseBody);

    if (!tableDataSchema) {
        throw new Error(
            '获取数据列表的接口 Schema 解析失败，没有识别到到列表数据字段',
        );
    }
    const children: Component[] = [];

    if (hasSearch(query.requestBody)) {
        children.push(genSearchForm(query.requestBody));
    }
    children.push(genTableComponent(tableDataSchema));
    if (paginationSchema) {
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
    dataField: string;
    pagination?: string;
}): string {
    const result: string[] = ['dataSource'];
    if (options.pagination) {
        result.push('pagination', 'changePage', 'changePageSize');
    }
    if (options.hasSearch) {
        result.push('refresh');
    }

    const functionName = options.pagination ? 'useTable' : 'useSimpleTable';

    return `
    const { ${result.join(', ')} } = ${functionName}({
        url: '${options.url}',
        ${
            options.dataField !== 'cycle'
                ? `dataField='${options.dataField}',`
                : ''
        }
        ${
            options.pagination !== 'page'
                ? `dataField='${options.pagination}',`
                : ''
        }
    })
    `;
}

function genTableSetupCode(options: {
    url: string;
    hasSearch: boolean;
    dataField: string;
    pagination?: string;
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

function genSearchFormSetupCode(requestBody: JSONSchema7): SetupCode {
    const importSources: ImportSource[] = [
        {
            imported: 'reactive',
            type: ImportType.ImportSpecifier,
            source: 'vue',
        },
    ];
    let watchCode = '';
    if (isReactiveSearch(requestBody)) {
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

    const fields = Object.keys(requestBody.properties).map((key) => {
        return `${key}: null`;
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
    const paginationField = findPaginationField(pageConfig.query.responseBody);
    const tableDataField = findTableDataField(pageConfig.query.responseBody);
    const hasSearchFlag = hasSearch(pageConfig.query.requestBody);
    const setupCodes: SetupCode[] = [
        genTableSetupCode({
            url: pageConfig.query.url,
            hasSearch: hasSearchFlag,
            dataField:
                tableDataField === pageConfig.commonDataField
                    ? ''
                    : tableDataField,
            pagination: paginationField,
        }),
    ];

    if (hasSearchFlag) {
        setupCodes.push(genSearchFormSetupCode(pageConfig.query.requestBody));
    }

    setupCodes.push(genPageMeta(pageConfig.meta));

    return setupCodes;
}

export function genListPageSchema(pageConfig: ListPageConfig): Schema {
    const sfc: SFCComponent = {
        componentName: 'Page',
        dir: PAGE_DIR,
        fileName: `${genSFCFileName(pageConfig.meta.name)}.vue`,
        setupCodes: genSetupCode(pageConfig),
        children: [
            {
                componentName: 'div',
                props: {
                    class: {
                        type: 'string',
                        value: 'common-page',
                    },
                },
                children: genTemplate(pageConfig.query),
            },
        ],
    };

    const jsCodes = getJsCode(join(__dirname, '../template', 'common'));

    return {
        SFCComponent: [sfc],
        css: defaultPageCss,
        jsCodes,
        dependencies: defaultDependencies,
    };
}
