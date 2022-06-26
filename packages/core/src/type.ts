export interface Schema {
    SFCComponent: SFCComponent[];
    css?: CSS;
    jsCodes?: JSCode[];
    dependencies?: DependentResource[];
}

export interface JSCode {
    content: string;
    dir?: string;
    fileName: string;
}

export enum ImportType {
    ImportDefaultSpecifier = 'ImportDefaultSpecifier',
    ImportSpecifier = 'ImportSpecifier',
}

export interface ImportSource {
    imported?: string;
    source: string;
    type: ImportType;
    local?: string;
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
    importSources?: ImportSource[];
    propsDefinition?: ComponentPropDefinition[];
    title?: string; // 页面 title
}

export enum ExtensionType {
    JSDeclaration = 'JSDeclaration',
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
