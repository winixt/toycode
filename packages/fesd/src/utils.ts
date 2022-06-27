import { JSONSchema7 } from 'json-schema';
import { camelCase } from 'lodash-es';

export function hasSearch(requestBody: JSONSchema7) {
    return !!Object.keys(requestBody.properties).length;
}

export function findPagination(
    reponseBody: JSONSchema7,
    level = 0,
): {
    field: string;
    jsonSchema: JSONSchema7;
} {
    // 只找到第二层
    if (level > 1) return null;

    if (reponseBody.type === 'object') {
        const properties = reponseBody.properties;
        for (const key in properties) {
            if (key === 'pagination' || key === 'page' || key === 'pager') {
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

export function findPaginationSchema(reponseBody: JSONSchema7): JSONSchema7 {
    const result = findPagination(reponseBody);
    return result ? result.jsonSchema : null;
}

export function findPaginationField(reponseBody: JSONSchema7) {
    const result = findPagination(reponseBody);
    return result ? result.field : null;
}

export function findTableData(
    reponseBody: JSONSchema7,
    level = 0,
): {
    field: string;
    jsonSchema: JSONSchema7;
} {
    // 只找到第二层
    if (level > 1) return null;

    if (reponseBody.type === 'object') {
        const properties = reponseBody.properties;
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

export function findTableDataSchema(reponseBody: JSONSchema7) {
    const result = findTableData(reponseBody);
    return result ? result.jsonSchema : null;
}

export function findTableDataField(reponseBody: JSONSchema7) {
    const result = findTableData(reponseBody);
    return result ? result.field : null;
}

export function genSFCFileName(fileName: string) {
    return camelCase(fileName);
}
