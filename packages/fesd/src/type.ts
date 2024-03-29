import type { SetupCode, Component } from '@qlin/toycode-core';

export interface Package {
    package: string;
    version: string;
}

export interface CodeSnippet {
    setup: SetupCode;
    component: Component;
}

export interface Option {
    label: string;
    value: string;
}

export interface TableSetupOption {
    hasRefresh?: boolean;
    isInit?: boolean;
}

export enum RuleTypeEnum {
    required = 'required',
    integer = 'integer',
    positiveInteger = 'positiveInteger',
    numberRange = 'numberRange',
    strLength = 'strLength',
    email = 'email',
    regexp = 'regexp',
    custom = 'custom',
}

export interface Rule {
    type: RuleTypeEnum;
    message?: string;
    [key: string]: any;
}

export interface RenderComponent {
    componentName: string;
    props: Record<string, any>;
    defaultValue?: any;
    appendAll?: boolean;
    required: boolean;
    rules: Rule[];
}

export interface Field {
    name: string;
    alias?: string;
    title: string;
    type: string;
    checked: boolean;
    mappingId?: string;
    options?: Option[];
    mapFields?: string[];
    component: RenderComponent;
    apiSchema?: APISchema;
}
export interface APISchema {
    url: string;
    method: string;
    headers: Record<string, string>;
    params: Field[]; // 请求参数字段描述
    resData: {
        type: string;
        pick: string[];
        fields: Field[]; // 响应参数字段描述
    };
    pagination?: {
        pick: string[];
        fields: Field[];
    };
}

export interface BlockMeta {
    name: string;
    type: string;
    title?: string;
    outputDir?: string;
}

/**
 * modify 处理新增和修改相同接口的场景
 * switchStatus 简单状态切换
 */
export interface RelationModal {
    title: string; // 当 type === 'modify, title 动态生成
    type: 'add' | 'delete' | 'update' | 'switchStatus' | 'export' | 'view';
    meta?: Record<string, string>; // 存放一些附加信息
    apiSchema?: APISchema;
    viewProps?: Field[];
    viewExtraData?: APISchema;
}

export interface BlockSchema {
    meta: BlockMeta;
    apiSchema: APISchema;
    relationModals?: RelationModal[];
}
