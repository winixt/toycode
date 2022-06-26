import { Schema } from '@qlin/toycode-core';
import { JSONSchema7 } from 'json-schema';
import { defaultPageCss } from './config';
import { findPaginationSchema, findTableDataSchema } from './utils';

export interface APISchema {
    url: string;
    headers: Record<string, string>;
    requestBody: JSONSchema7;
    reponseBody: JSONSchema7;
}

export function genListPageSchema(apiDesign: {
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
}
