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
import { camelCase } from 'lodash-es';
import { APISchema, PageMeta } from '../type';
import { defaultPageCss } from '../config';
import {
    hasSearch,
    findPaginationSchema,
    findTableDataSchema,
    findPaginationField,
    findTableDataField,
    genSFCFileName,
} from '../utils';
import { PAGE_DIR } from '../constants';

interface ListPageConfig {
    meta: PageMeta;
    commonDataField: string;
    query: APISchema;
    add?: APISchema;
    modiry?: APISchema;
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
    const paginationSchema = findPaginationSchema(query.reponseBody);
    const tableDataSchema = findTableDataSchema(query.reponseBody);

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
        code: genUseTable(options),
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
        code: `
        defineRouteMeta({
            name: '${genSFCFileName(meta.name)}',
            title: '${meta.title}',
        });
        `,
    };
}

function genSetupCode(pageConfig: ListPageConfig) {
    const paginationField = findPaginationField(pageConfig.query.reponseBody);
    const tableDataField = findTableDataField(pageConfig.query.reponseBody);
    const setupCodes: SetupCode[] = [
        genPageMeta(pageConfig.meta),
        genTableSetupCode({
            url: pageConfig.query.url,
            hasSearch: hasSearch(pageConfig.query.requestBody),
            dataField:
                tableDataField === pageConfig.commonDataField
                    ? ''
                    : tableDataField,
            pagination: paginationField,
        }),
    ];

    return setupCodes;
}

export function genListPageSchema(pageConfig: ListPageConfig) {
    const sfc: SFCComponent = {
        componentName: 'Page',
        dir: PAGE_DIR,
        fileName: `${genSFCFileName(pageConfig.meta.name)}.vue`,
        title: pageConfig.meta.title,
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

    return sfc;
}
