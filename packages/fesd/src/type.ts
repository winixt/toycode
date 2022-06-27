import { JSONSchema7 } from 'json-schema';

export interface APISchema {
    url: string;
    headers: Record<string, string>;
    requestBody: JSONSchema7;
    reponseBody: JSONSchema7;
}

export interface PageMeta {
    name: string;
    title: string;
}
