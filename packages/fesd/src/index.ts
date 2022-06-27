import {
    Schema,
    SFCComponent,
    Component,
    ExtensionType,
} from '@qlin/toycode-core';
import { JSONSchema7 } from 'json-schema';
import { camelCase } from 'lodash-es';
import { defaultPageCss } from './config';
import { findPaginationSchema, findTableDataSchema } from './utils';
import { PAGE_DIR } from './constants';

export interface APISchema {
    url: string;
    headers: Record<string, string>;
    requestBody: JSONSchema7;
    reponseBody: JSONSchema7;
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
                        'v-model': `formModel.${key}`,
                    },
                },
            ],
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

export function genListPageSchema(apiDesign: {
    name: string;
    title: string;
    query: APISchema;
    add?: APISchema;
    modiry?: APISchema;
    simpleModify?: APISchema;
    remove?: APISchema;
}) {
    const paginationSchema = findPaginationSchema(apiDesign.query.reponseBody);
    const tableDataSchema = findTableDataSchema(apiDesign.query.reponseBody);

    if (!tableDataSchema) {
        throw new Error(
            '获取数据列表的接口 Schema 解析失败，没有识别到到列表数据字段',
        );
    }
    const children: Component[] = [];
    if (Object.keys(apiDesign.query.requestBody.properties).length) {
        children.push(genSearchForm(apiDesign.query.requestBody));
    }
    children.push(genTableComponent(tableDataSchema));
    if (paginationSchema) {
        children.push(genPaginationComp());
    }
    const sfc: SFCComponent = {
        componentName: 'Page',
        dir: PAGE_DIR,
        fileName: `${camelCase(apiDesign.name)}.vue`,
        title: apiDesign.title,
        children: [
            {
                componentName: 'div',
                props: {
                    class: {
                        type: 'string',
                        value: 'common-page',
                    },
                },
                children,
            },
        ],
    };
}
