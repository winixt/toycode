import { Schema } from '@qlin/toycode-core';
import { JSONSchema7 } from 'json-schema';
import { defaultSchema } from './config';

export interface APISchema {
    url: string;
    headers: Record<string, string>;
    requestBody: JSONSchema7;
    reponseBody: JSONSchema7;
}

export function genSchema() {}
