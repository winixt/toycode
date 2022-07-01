export interface Field {
    name: string;
    title: string;
    type: 'number' | 'string' | 'array' | 'object' | 'boolean';
    checked?: boolean;
    mappingId?: string;
}

export interface FormField {
    componentName: string;
    props: {
        [key: string]: any;
    };
}

export interface ListPageSchema {
    url: string;
    dataField: string;
    pageField?: string;
    params: FormField[];
}
