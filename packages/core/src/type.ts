export interface Schema {
    config: SchemaConfig;
    SFCComponent: SFCComponent[];
    css?: CSS;
    common?: DefineFunction[];
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
    dir?: string;
    fileName: string;
}

export interface ImportResource {
    importName: string;
    package: string;
    isDefaultImport?: boolean;
    aliasName?: string;
}

export interface SFCComponent {
    componentName: 'Page' | 'Component';
    dir?: string;
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

export enum ExtensionType {
    JSFunction = 'JSFunction',
    JSExpression = 'JSExpression',
    JSSlot = 'JSSlot',
}

export interface Component {
    id: string;
    componentName: string;
    props?: ComponentProps;
    events?: ComponentEvents;
    directives?: ComponentDirectives;
    constantExpressions?: ConstantsExpression[];
    reactiveExpressions?: ReactiveExpression[];
    watchExpressions?: WatchExpression[];
    functions?: DefineFunction[];
    parentId?: string;
    loop?: [];
    loopArgs?: [string, string]; // default [“item”, “index”]
    condition?: boolean | ExtensionType.JSExpression;
    children?: Component[];
    slots?: ComponentSlots;
}

export interface ComponentSlots {
    id: string;
    parentId: string;
    slots: ComponentSlot[];
}

export interface ComponentSlot {
    name: string;
    scoped: string;
    component: Component;
}

interface PropValue {
    type:
        | 'string'
        | 'number'
        | 'boolean'
        | 'object'
        | ExtensionType.JSExpression;
    value: string | number | boolean | object;
}

export interface ComponentProps {
    id?: PropValue;
    class?: PropValue;
    style?: PropValue;
    ref?: PropValue;
    [key: string]: PropValue;
}

export interface ComponentEvents {
    [key: string]: string;
}

export interface ComponentDirectives {
    [key: string]: string;
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

export interface SchemaConfig {
    common: {
        useDir: string;
        serviceDir: string;
        constantsPath: string;
        utilsDir: string;
    };
    componentsDir: string;
    pageDir: string;
}

export interface CSS {
    lang: 'css' | 'less';
    content: string;
    dir?: string;
    fileName?: string;
    scoped?: boolean;
    injectSFC?: boolean;
}

export interface PreChangeFile {
    file: string;
    content: string;
}
