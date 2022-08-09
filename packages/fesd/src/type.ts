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

/**
 * modify 处理新增和修改相同接口的场景
 * simpleUpdate 处理简单修改的场景，例如：设置为有效/无效
 */
export interface RelationModal {
    title: string; // 当 type === 'modify, title 动态生成
    type: 'add' | 'delete' | 'update' | 'simpleUpdate' | 'modify';
    meta: Record<string, string>; // 存放一些附加信息
    apiSchema: APISchema;
}

/**
 * TODO
 * 优化 commonDataField 字段，做为项目全局配置
 */
export interface ListPageConfig {
    meta: PageMeta;
    commonDataField: string;
    apiSchema: APISchema;
    relationModal?: RelationModal[];
}
