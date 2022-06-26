import { JSONSchema7 } from 'json-schema';

export function findPaginationSchema(
    reponseBody: JSONSchema7,
    level = 0,
): JSONSchema7 {
    // 只找到第二层
    if (level > 1) return null;

    if (reponseBody.type === 'object') {
        const properties = reponseBody.properties;
        for (const key in properties) {
            if (key === 'pagination' || key === 'page' || key === 'pager') {
                return properties[key] as JSONSchema7;
            }
            if ((properties[key] as JSONSchema7)?.type === 'object') {
                const field = findPaginationSchema(
                    properties[key] as JSONSchema7,
                    level + 1,
                );
                if (field) return field;
            }
        }
    }
    return null;
}

export function findTableDataSchema(
    reponseBody: JSONSchema7,
    level = 0,
): JSONSchema7 {
    // 只找到第二层
    if (level > 1) return null;

    if (reponseBody.type === 'object') {
        const properties = reponseBody.properties;
        for (const key in properties) {
            if (
                (properties[key] as JSONSchema7)?.type === 'array' &&
                (properties[key] as JSONSchema7)?.items === 'object'
            ) {
                return properties[key] as JSONSchema7;
            }
            if ((properties[key] as JSONSchema7)?.type === 'object') {
                const field = findTableDataSchema(
                    properties[key] as JSONSchema7,
                    level + 1,
                );
                if (field) return field;
            }
        }
    }
    return null;
}
