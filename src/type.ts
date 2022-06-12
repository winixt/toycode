export interface Schema {
    config: SchemaConfig;
    css?: CSS;
    utils?: DefineFunction[];
    uses?: DefineFunction[];
    services?: DefineFunction[];
    constants?: DefineConstants[];
    dependencies?: DependentResource[];
}

export interface DefineConstants {
    exportName: string;
    content: string;
}

export interface DefineFunction {
    exportName: string;
    content: string;
    importResources?: ImportResource[];
}

export interface ImportResource {
    importName: string;
    pakage: string;
    isDefaultImport?: boolean;
    aliasName?: string;
}
export interface ContainerComponent {
    componentName: 'Page' | 'Block' | 'Component';
    dir: string;
    fileName: string;
    children: Component[];
    constantExpressions?: ConstantsExpression[];
    reactiveExpressions?: ReactiveExpression[];
    watchExpressions?: WatchExpression[];
    functions?: DefineFunction[];
    css?: CSS;
    importResources?: ImportResource[];
    propDefinitions?: ComponentPropDefinition[];
}

export interface Component {
    id: string;
    componentName: string;
    children?: Component[];
}

export interface ConstantsExpression {
    name: string;
    constent: string;
}

export interface ReactiveExpression {
    type: 'ref' | 'computed' | 'reactive';
    name: string;
    content: string;
}

export interface WatchExpression {
    target: string;
    content: string;
    options: Record<string, string | number | boolean>;
}

export interface DefineFunction {
    name: string;
    content: string;
}

export type PropType =
    | 'Boolean'
    | 'String'
    | 'Array'
    | 'Object'
    | 'Function'
    | 'Number';

export interface ComponentPropDefinition {
    name: string;
    propType: PropType;
    description: string;
    defaultValue: any;
}

export interface DependentResource {
    package: string;
    version: string;
}

interface SchemaConfig {
    common: {
        useDir: string;
        serviceDir: string;
        constantsPath: string;
        utilsDir: string;
    };
    componentsDir: string;
    pageDir: string;
}

interface CSS {
    lang: 'css' | 'less' | 'scss';
    content: string;
    dir?: string;
    fileName?: string;
    scoped?: boolean;
    injectSFC?: boolean;
}
