export interface Option {
    label: string;
    value: string;
}

export interface Field {
    name: string;
    alias?: string;
    title: string;
    type: string;
    required: boolean;
    checked: boolean;
    mappingId?: string;
    options?: Option[];
    defaultValue?: any;
    maxLength?: number;
    minLength?: number;
}

export interface FormField extends Field {
    checked: boolean;
    componentName: string;
    props: Record<string, any>;
    appendAll?: boolean;
}

export interface APISchema {
    url: string;
    method: string;
    headers: Record<string, string>;
    params: FormField[];
    resData: {
        pick: string[];
        fields: Field[];
    };
    pagination?: {
        pick: string[];
        fields: Field[];
    };
}

export interface PageMeta {
    name: string;
    title: string;
}

export interface ListPageConfig {
    meta: PageMeta;
    commonDataField: string;
    query: APISchema;
    add?: APISchema;
    modify?: APISchema;
    simpleModify?: APISchema;
    remove?: APISchema;
}
