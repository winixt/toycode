export interface Field {
    name: string;
    title: string;
    type: string;
    required: boolean;
    checked: boolean;
    mappingId?: string;
    defaultValue?: boolean;
    maxLength?: number;
    minLength?: number;
}

export interface Option {
    label: string;
    value: string;
}

export interface FormField extends Field {
    checked: boolean;
    componentName: string;
    props: Record<string, any>;
    mappingId?: string;
    options?: Option[];
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
    page?: {
        pick: string[];
        fields: Field[];
    };
}

export interface PageMeta {
    name: string;
    title: string;
}
