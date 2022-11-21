import {
    SFCComponent,
    SetupCode,
    ImportType,
    genComponentId,
    Component,
    ExtensionType,
} from '@qlin/toycode-core';
import { isEmpty } from 'lodash';
import { RelationModal, BlockSchema, APISchema, CodeSnippet } from '../type';
import {
    hasModal,
    genModalDir,
    genFileNameByPath,
    genComponentName,
} from '../utils';
import { ROW_DATA_PROP_NAME } from '../constants';
import { getDefaultValue, mergeCodeSnippets } from './shared';
import { genFormCodeSnippet } from './form';
import { genDescriptionsSnippet } from './descriptions';
import type { Context } from '../context';

import { genViewTableComponent } from './table';

const getCommonModalImportSource = (ctx: Context) => {
    return [
        {
            imported: 'FModal',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes-design',
        },
        {
            imported: 'FMessage',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes-design',
        },
        {
            imported: 'useModal',
            type: ImportType.ImportSpecifier,
            source: `${ctx.getUseDirImp()}/useModal`,
        },
        {
            imported: 'request',
            type: ImportType.ImportSpecifier,
            source: '@fesjs/fes',
        },
    ];
};

function getModalComponent(title: string): Component {
    return {
        id: genComponentId(),
        componentName: 'FModal',
        props: {
            title,
            maskClosable: false,
            top: 54,
            displayDirective: 'if',
        },
        events: {
            ok: 'confirm',
        },
        directives: {
            'v-model:show': 'innerVisible',
        },
        children: [],
    };
}

function genAddModalCodeSnippet(
    ctx: Context,
    modal: RelationModal,
): CodeSnippet {
    return {
        setup: {
            importSources: getCommonModalImportSource(ctx),
            content: `
            const onConfirm = async (data) => {
                const res = await request('${modal.apiSchema.url}', data);
                FMessage.success('新增成功');
                props.onSuccess(data, res);
            };
            const { formRefEl, formModel, confirm, innerVisible } = useModal({ props, emit, initData, onConfirm });
            `,
        },
        component: getModalComponent(modal.meta.title || '新增'),
    };
}

function genViewModalCodeSnippet(
    ctx: Context,
    modal: RelationModal,
): CodeSnippet {
    return {
        setup: {
            importSources: [
                {
                    imported: 'FModal',
                    type: ImportType.ImportSpecifier,
                    source: '@fesjs/fes-design',
                },
                {
                    imported: 'FButton',
                    type: ImportType.ImportSpecifier,
                    source: '@fesjs/fes-design',
                },
                {
                    imported: 'useNormalModel',
                    type: ImportType.ImportSpecifier,
                    source: `${ctx.getUseDirImp()}/useModel`,
                },
            ],
            content: `
            const [innerVisible, updateVisible]= useNormalModel(props, emit, {
                prop: 'visible',
            });
            `,
        },
        component: {
            id: genComponentId(),
            componentName: 'FModal',
            props: {
                title: modal.meta.title || '查看',
                maskClosable: false,
                displayDirective: 'if',
                top: 54,
            },
            directives: {
                'v-model:show': 'innerVisible',
            },
            children: [],
            slots: [
                {
                    name: 'footer',
                    component: {
                        componentName: 'FButton',
                        props: {
                            type: 'primary',
                        },
                        events: {
                            click: 'updateVisible(false)',
                        },
                        children: ['关闭'],
                    },
                },
            ],
        },
    };
}

function genInitData(addModal: RelationModal): SetupCode {
    const fieldDefaultValue = addModal.apiSchema.params.map((item) => {
        return `${item.name}: ${getDefaultValue(item)}`;
    });
    return {
        importSources: [],
        content: `
        const initData = {
            ${fieldDefaultValue.join(',')}
        };
        `,
    };
}

export function genAddModal(
    ctx: Context,
    addModal: RelationModal,
    modalDir: string,
): SFCComponent {
    const modalSnippet = genAddModalCodeSnippet(ctx, addModal);
    const formSnippet = genFormCodeSnippet(
        ctx,
        addModal.apiSchema,
        modalSnippet.component.id,
    );
    const codeSnippets: CodeSnippet[] = [modalSnippet, formSnippet];
    const { children, setupCodes } = mergeCodeSnippets(codeSnippets);
    return {
        componentName: 'SFCComponent',
        dir: modalDir,
        fileName: 'addModal.vue',
        children,
        setupCodes: [genInitData(addModal), ...setupCodes],
        propsDefinition: [
            {
                name: 'visible',
                propType: 'Boolean',
            },
            {
                name: 'onSuccess',
                propType: 'Function',
            },
        ],
        emitsDefinition: ['update:visible'],
    };
}

function genUpdateModalCodeSnippet(
    ctx: Context,
    modal: RelationModal,
): CodeSnippet {
    return {
        setup: {
            importSources: [
                ...getCommonModalImportSource(ctx),
                {
                    imported: 'computed',
                    type: ImportType.ImportSpecifier,
                    source: 'vue',
                },
            ],
            content: `
            const onConfirm = async (data) => {
                const res = await request('${modal.apiSchema.url}', data);
                FMessage.success('修改成功');
                props.onSuccess(data, res);
            };
            const { formRefEl, formModel, confirm, innerVisible } = useModal({ props, emit, initData: computed(() => props.${ROW_DATA_PROP_NAME}), onConfirm });
            `,
        },
        component: getModalComponent(modal.meta.title || '编辑'),
    };
}

function genViewTableSnippet(apiSchema: APISchema, parentId: string) {
    const fileName = genFileNameByPath(apiSchema.url);
    const componentName = genComponentName(fileName);
    return {
        setup: {
            importSources: [
                {
                    imported: componentName,
                    type: ImportType.ImportDefaultSpecifier,
                    source: `./${fileName}.vue`,
                },
            ],
            content: '',
        },
        component: {
            parentId,
            componentName,
            props: {
                [ROW_DATA_PROP_NAME]: {
                    type: ExtensionType.JSExpression,
                    value: ROW_DATA_PROP_NAME,
                },
            },
        },
    };
}

export function genUpdateModal(
    ctx: Context,
    modal: RelationModal,
    modalDir: string,
): SFCComponent[] {
    const modalSnippet = genUpdateModalCodeSnippet(ctx, modal);
    const formSnippet = genFormCodeSnippet(
        ctx,
        modal.apiSchema,
        modalSnippet.component.id,
    );
    const codeSnippets: CodeSnippet[] = [modalSnippet, formSnippet];
    if (!isEmpty(modal.viewProps)) {
        codeSnippets.push(
            genDescriptionsSnippet(modal.viewProps, modalSnippet.component.id),
        );
    }
    if (!isEmpty(modal.viewExtraData)) {
        codeSnippets.push(
            genViewTableSnippet(modal.viewExtraData, modalSnippet.component.id),
        );
    }
    const { children, setupCodes } = mergeCodeSnippets(codeSnippets);
    const result: SFCComponent[] = [
        {
            componentName: 'SFCComponent',
            dir: modalDir,
            fileName: 'updateModal.vue',
            children,
            setupCodes: [...setupCodes],
            propsDefinition: [
                {
                    name: 'visible',
                    propType: 'Boolean',
                },
                {
                    name: ROW_DATA_PROP_NAME,
                    propType: 'Object',
                },
                {
                    name: 'onSuccess',
                    propType: 'Function',
                },
            ],
            emitsDefinition: ['update:visible'],
        },
    ];

    if (modal.viewExtraData) {
        result.push(genViewTableComponent(ctx, modal.viewExtraData, modalDir));
    }

    return result;
}

export function genViewModal(
    ctx: Context,
    modal: RelationModal,
    modalDir: string,
): SFCComponent[] {
    const modalSnippet = genViewModalCodeSnippet(ctx, modal);
    const codeSnippets: CodeSnippet[] = [modalSnippet];
    if (!isEmpty(modal.viewProps)) {
        codeSnippets.push(
            genDescriptionsSnippet(modal.viewProps, modalSnippet.component.id),
        );
    }
    if (!isEmpty(modal.viewExtraData)) {
        codeSnippets.push(
            genViewTableSnippet(modal.viewExtraData, modalSnippet.component.id),
        );
    }
    const { children, setupCodes } = mergeCodeSnippets(codeSnippets);
    const result: SFCComponent[] = [
        {
            componentName: 'SFCComponent',
            dir: modalDir,
            fileName: 'viewModal.vue',
            children,
            setupCodes: [...setupCodes],
            propsDefinition: [
                {
                    name: 'visible',
                    propType: 'Boolean',
                },
                {
                    name: ROW_DATA_PROP_NAME,
                    propType: 'Object',
                },
            ],
            emitsDefinition: ['update:visible'],
        },
    ];

    if (modal.viewExtraData) {
        result.push(genViewTableComponent(ctx, modal.viewExtraData, modalDir));
    }

    return result;
}

function formatModalApiSchema(modal: RelationModal) {
    if (modal.apiSchema?.params) {
        modal.apiSchema.params = modal.apiSchema.params.filter(
            (item) => item.checked,
        );
    }
}

export function genRelationModals(
    ctx: Context,
    pageConfig: BlockSchema,
): SFCComponent[] {
    const modals: SFCComponent[] = [];
    if (hasModal(pageConfig)) {
        const modalDir = genModalDir(ctx, pageConfig);

        pageConfig.relationModals.forEach((modal) => {
            formatModalApiSchema(modal);
            if (modal.type === 'add') {
                modals.push(genAddModal(ctx, modal, modalDir));
            } else if (modal.type === 'update') {
                modals.push(...genUpdateModal(ctx, modal, modalDir));
            } else if (modal.type === 'view') {
                modals.push(...genViewModal(ctx, modal, modalDir));
            }
        });
    }

    return modals;
}
