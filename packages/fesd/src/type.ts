import type { SetupCode, Component } from '@qlin/toycode-core';

export interface CodeSnippet {
    setup: SetupCode;
    component: Component;
}

export interface Option {
    label: string;
    value: string;
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
    component: RenderComponent;
}
export interface APISchema {
    url: string;
    method: string;
    headers: Record<string, string>;
    params: Field[];
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
 *
 * TODO
 * 实现 modify 的编译
 */
export interface RelationModal {
    title: string; // 当 type === 'modify, title 动态生成
    type: 'add' | 'delete' | 'update' | 'simpleUpdate' | 'modify';
    meta?: Record<string, string>; // 存放一些附加信息
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
    relationModals?: RelationModal[];
}
