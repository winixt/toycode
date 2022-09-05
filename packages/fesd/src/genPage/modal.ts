import {
    SFCComponent,
    SetupCode,
    ImportType,
    genComponentId,
    Component,
} from '@qlin/toycode-core';
import { RelationModal, BlockSchema, CodeSnippet } from '../type';
import { hasModal, genModalDir } from '../utils';
import { getDefaultValue, mergeCodeSnippets } from './shared';
import { genFormCodeSnippet } from './form';

const COMMON_MODAL_IMPORT_SOURCES = [
    {
        imported: 'FModal',
        type: ImportType.ImportSpecifier,
        source: '@/common/constants',
    },
    {
        imported: 'FMessage',
        type: ImportType.ImportSpecifier,
        source: '@/common/constants',
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
        component: getModalComponent(modal.title || '新增'),
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
    const { children, setupCodes } = mergeCodeSnippets([
        modalSnippet,
        formSnippet,
    ]);
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
            const { formRefEl, formModel, confirm, innerVisible } = useModal({ props, emit, computed(() => props.data), onConfirm });
            `,
        },
        component: getModalComponent(modal.title || '编辑'),
    };
}

export function genUpdateModal(
    modal: RelationModal,
    modalDir: string,
): SFCComponent {
    const modalSnippet = genUpdateModalCodeSnippet(modal);
    const formSnippet = genFormCodeSnippet(
        modal.apiSchema,
        modalSnippet.component.id,
    );
    const { children, setupCodes } = mergeCodeSnippets([
        modalSnippet,
        formSnippet,
    ]);
    return {
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
                name: 'data',
                propType: 'Object',
            },
            {
                name: 'onSuccess',
                propType: 'Function',
            },
        ],
        emitsDefinition: ['update:visible'],
    };
}

export function genRelationModals(pageConfig: BlockSchema): SFCComponent[] {
    const modals: SFCComponent[] = [];
    if (hasModal(pageConfig)) {
        const modalDir = genModalDir(pageConfig);

        pageConfig.relationModals.forEach((modal) => {
            if (modal.type === 'add') {
                modals.push(genAddModal(modal, modalDir));
            } else if (modal.type === 'update') {
                modals.push(genUpdateModal(modal, modalDir));
            }
        });
    }

    return modals;
}
