import {
    Schema,
    SFCComponent,
    Component,
    ExtensionType,
    ImportType,
    ImportSource,
    SetupCode,
} from '@qlin/toycode-core';
import { APISchema, Field, BlockMeta, BlockSchema } from '../type';
import { defaultPageCss } from '../config';
import {
    genSFCFileName,
    genDirAndFileName,
    isGenComponent,
    genOptionsName,
} from '../utils';
import { componentMap } from '../componentMap';
import { applySearchAction } from './searchAction';
import { genRelationModals } from './modal';
import { applyModal } from './useModal';
import { handleComponentOptions, formReqData, formatResData } from './shared';
import { genTableSetupCode, genTableTemplate } from './table';
import { genFetchCode, genFormImportResources } from './form';
import { getCommonJsCode } from '../genCommonCode/index';
import { Context } from '../context';

// REFACTOR 抽离 search form 相关代码到独立的文件
function genSearchForm(params: Field[]) {
    const form: Component = {
        componentName: 'FForm',
        props: {
            layout: 'inline',
        },
        children: [],
    };
    for (const item of params) {
        const comp = componentMap(item.component.componentName);
        const formCompProps: Record<string, any> = {
            ...item.component.props,
            ...comp.props,
        };
        let children: Component[];
        if (item.mappingId) {
            if (item.component.appendAll) {
                formCompProps.options = {
                    type: ExtensionType.JSExpression,
                    value: `appendAll(${item.mappingId})`,
                };
            } else {
                formCompProps.options = {
                    type: ExtensionType.JSExpression,
                    value: item.mappingId,
                };
            }
        } else if (item.options?.length) {
            children = handleComponentOptions(item.options, comp.subName);
            if (item.component.appendAll) {
                children.unshift({
                    componentName: comp.subName,
                    props: {
                        label: '全部',
                        value: null,
                    },
                });
            }
        } else if (item.apiSchema) {
            formCompProps.options = {
                type: ExtensionType.JSExpression,
                value: genOptionsName(item.name),
            };
            if (item.component.appendAll) {
                children = [
                    {
                        componentName: comp.subName,
                        props: {
                            label: '全部',
                            value: null,
                        },
                    },
                ];
            }
        }
        form.children.push({
            componentName: 'FFormItem',
            props: {
                label: item.title,
            },
            children: [
                {
                    componentName: comp.name,
                    props: formCompProps,
                    directives: {
                        'v-model': `searchParams.${item.name}`,
                    },
                    children,
                },
            ],
        });
    }
    return form;
}

function genTemplate(apiSchema: APISchema) {
    const children: Component[] = [];

    if (apiSchema.params?.length) {
        children.push(genSearchForm(apiSchema.params));
    }

    return [...children, ...genTableTemplate(apiSchema)];
}

function genBlockMeta(meta: BlockMeta) {
    if (!isGenComponent(meta)) {
        const importSources: ImportSource[] = [
            {
                imported: 'defineRouteMeta',
                type: ImportType.ImportSpecifier,
                source: '@fesjs/fes',
            },
        ];

        return {
            importSources,
            content: `
            defineRouteMeta({
                name: '${genSFCFileName(meta.name)}',
                ${meta.title ? `title: '${meta.title}',` : ''}
            });
            `,
        };
    }
}

function genSearchFormSetupCode(ctx: Context, params: Field[]): SetupCode {
    const importSources: ImportSource[] = [
        ...genFormImportResources(ctx, params),
        ...genAppendAllCode(ctx, params),
        {
            imported: 'reactive',
            type: ImportType.ImportSpecifier,
            source: 'vue',
        },
    ];

    const fetchCode = genFetchCode(ctx, params);

    return {
        importSources: importSources.concat(fetchCode.importSources),
        content: `
        const searchParams = reactive({
            ...initSearchParams
        });
        ${fetchCode.content}
        `,
    };
}

function genAppendAllCode(ctx: Context, fields: Field[]) {
    const importSources: ImportSource[] = [];
    if (fields.find((item) => item.component.appendAll)) {
        importSources.push({
            imported: 'appendAll',
            type: ImportType.ImportSpecifier,
            source: ctx.getUtilsFilePathImp(),
        });
    }

    return importSources;
}

function genInitSearchParams(params: Field[]): SetupCode {
    let content = '';
    if (params.length) {
        const fields = params.map((item) => {
            return `${item.name}: null`;
        });
        content = `
        const initSearchParams = {
            ${fields.join(', ')}
        }
        `;
    }
    return {
        importSources: [],
        content,
    };
}

function genSetupCode(ctx: Context, pageConfig: BlockSchema) {
    const queryApiSchema = pageConfig.apiSchema;
    const setupCodes: SetupCode[] = [
        genInitSearchParams(queryApiSchema.params),
        genTableSetupCode(ctx, queryApiSchema, {
            hasRefresh: !!(
                queryApiSchema.params.length || pageConfig.relationModals.length
            ),
        }),
    ];

    if (queryApiSchema.params.length) {
        setupCodes.push(genSearchFormSetupCode(ctx, queryApiSchema.params));
    }

    setupCodes.push(genBlockMeta(pageConfig.meta));

    return setupCodes.filter(Boolean);
}

export function genBlockSchema(ctx: Context, pageConfig: BlockSchema): Schema {
    pageConfig.apiSchema.params = formReqData(
        pageConfig.apiSchema.params || [],
    );
    pageConfig.apiSchema.resData.fields = formatResData(
        pageConfig.apiSchema.resData.fields,
    );

    const initSFC: SFCComponent = {
        componentName: 'SFCComponent',
        ...genDirAndFileName(ctx, pageConfig),
        setupCodes: genSetupCode(ctx, pageConfig),
        children: [
            {
                componentName: 'div',
                props: {
                    class: 'common-page',
                },
                children: genTemplate(pageConfig.apiSchema),
            },
        ],
    };

    const sfc = [applySearchAction, applyModal].reduce((acc, action) => {
        return action(ctx, pageConfig, acc);
    }, initSFC);

    return {
        componentsTree: [sfc, ...genRelationModals(ctx, pageConfig)],
        css: defaultPageCss,
        jsCodes: getCommonJsCode(ctx),
        dependencies: ctx.dependence.getPackages(),
    };
}
