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
import { Context } from '../context';

import { genViewTableComponent } from './table';

const COMMON_MODAL_IMPORT_SOURCES = [
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
        source: '@/common/use/useModal',
    },
    {
        imported: 'request',
        type: ImportType.ImportSpecifier,
        source: '@fesjs/fes',
    },
];

function getModalComponent(title: string): Component {
    return {
        id: genComponentId(),
        componentName: 'FModal',
        props: {
            title,
            maskClosable: false,
            top: 54,
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

function genAddModalCodeSnippet(modal: RelationModal): CodeSnippet {
    return {
        setup: {
            importSources: COMMON_MODAL_IMPORT_SOURCES,
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

function genViewModalCodeSnippet(modal: RelationModal): CodeSnippet {
    return {
        setup: {
            importSources: [
                {
                    imported: 'FModal',
                    type: ImportType.ImportSpecifier,
                    source: '@fesjs/fes-design',
                },
                {
                    imported: 'useNormalModel',
                    type: ImportType.ImportSpecifier,
                    source: '@/common/use/useModel',
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
    addModal: RelationModal,
    modalDir: string,
): SFCComponent {
    const modalSnippet = genAddModalCodeSnippet(addModal);
    const formSnippet = genFormCodeSnippet(
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

function genUpdateModalCodeSnippet(modal: RelationModal): CodeSnippet {
    return {
        setup: {
            importSources: COMMON_MODAL_IMPORT_SOURCES,
            content: `
            const onConfirm = async (data) => {
                const res = await request('${modal.apiSchema.url}', data);
                FMessage.success('新增成功');
                props.onSuccess(data, res);
            };
            const { formRefEl, formModel, confirm, innerVisible } = useModal({ props, emit, computed(() => props.${ROW_DATA_PROP_NAME}), onConfirm });
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
                    source: `${fileName}.vue`,
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
                top: 54,
            },
        },
    };
}

export function genUpdateModal(
    ctx: Context,
    modal: RelationModal,
    modalDir: string,
): SFCComponent[] {
    const modalSnippet = genUpdateModalCodeSnippet(modal);
    const formSnippet = genFormCodeSnippet(
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
    const modalSnippet = genViewModalCodeSnippet(modal);
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

export function genRelationModals(
    ctx: Context,
    pageConfig: BlockSchema,
): SFCComponent[] {
    const modals: SFCComponent[] = [];
    if (hasModal(pageConfig)) {
        const modalDir = genModalDir(pageConfig);

        pageConfig.relationModals.forEach((modal) => {
            if (modal.type === 'add') {
                modals.push(genAddModal(modal, modalDir));
            } else if (modal.type === 'update') {
                modals.push(...genUpdateModal(ctx, modal, modalDir));
            } else if (modal.type === 'view') {
                modals.push(...genViewModal(ctx, modal, modalDir));
            }
        });
    }

    return modals;
}
