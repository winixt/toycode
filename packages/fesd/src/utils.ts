import { JSONSchema7 } from 'json-schema';
import { camelCase } from 'lodash-es';

export function isPaginationField(field: string) {
    return field === 'pagination' || field === 'page' || field === 'pager';
}

export function hasSearch(requestBody: JSONSchema7) {
    return !!Object.keys(requestBody.properties).filter((key) => {
        return !isPaginationField(key);
    }).length;
}

export function isReactiveSearch(requestBody: JSONSchema7) {
    const searchFieldCount = Object.keys(requestBody.properties).filter(
        (key) => {
            return !isPaginationField(key);
        },
    ).length;
    return searchFieldCount <= 3;
}

export function findPagination(
    responseBody: JSONSchema7,
    level = 0,
): {
    field: string;
    jsonSchema: JSONSchema7;
} {
    // 只找到第二层
    if (level > 1) return null;

    if (responseBody.type === 'object') {
        const properties = responseBody.properties;
        for (const key in properties) {
            if (isPaginationField(key)) {
                return {
                    field: key,
                    jsonSchema: properties[key] as JSONSchema7,
                };
            }
            if ((properties[key] as JSONSchema7)?.type === 'object') {
                const field = findPagination(
                    properties[key] as JSONSchema7,
                    level + 1,
                );
                if (field) return field;
            }
        }
    }
    return null;
}

export function findPaginationSchema(responseBody: JSONSchema7): JSONSchema7 {
    const result = findPagination(responseBody);
    return result ? result.jsonSchema : null;
}

export function findPaginationField(responseBody: JSONSchema7) {
    const result = findPagination(responseBody);
    return result ? result.field : null;
}

export function findTableData(
    responseBody: JSONSchema7,
    level = 0,
): {
    field: string;
    jsonSchema: JSONSchema7;
} {
    // 只找到第二层
    if (level > 1) return null;

    if (responseBody.type === 'object') {
        const properties = responseBody.properties;
        for (const key in properties) {
            if (
                (properties[key] as JSONSchema7)?.type === 'array' &&
                (properties[key] as JSONSchema7)?.items === 'object'
            ) {
                return {
                    field: key,
                    jsonSchema: properties[key] as JSONSchema7,
                };
            }
            if ((properties[key] as JSONSchema7)?.type === 'object') {
                const field = findTableData(
                    properties[key] as JSONSchema7,
                    level + 1,
                );
                if (field) return field;
            }
        }
    }
    return null;
}

export function findTableDataSchema(responseBody: JSONSchema7) {
    const result = findTableData(responseBody);
    return result ? result.jsonSchema : null;
}

export function findTableDataField(responseBody: JSONSchema7) {
    const result = findTableData(responseBody);
    return result ? result.field : null;
}

export function genSFCFileName(fileName: string) {
    return camelCase(fileName);
}
