import {
    SFCComponent,
    SetupCode,
    ImportType,
    genComponentId,
} from '@qlin/toycode-core';
import { RelationModal, ListPageConfig, CodeSnippet } from '../type';
import { hasModal, genModalDir } from '../utils';
import { getDefaultValue, mergeCodeSnippets } from './shared';
import { genFormCodeSnippet } from './form';

function genAddModalCodeSnippet(addModal: RelationModal): CodeSnippet {
    return {
        setup: {
            importSources: [
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
            ],
            content: `
            const onConfirm = async (data) => {
                const res = await request('${addModal.apiSchema.url}', data);
                FMessage.success('新增成功');
                props.onSuccess(data, res);
            };
            const { formRefEl, formModel, confirm, innerVisible } = useModal({ props, emit, initData, onConfirm });
            `,
        },
        component: {
            id: genComponentId(),
            componentName: 'FModal',
            props: {
                title: '新增',
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

export function genRelationModals(pageConfig: ListPageConfig): SFCComponent[] {
    const modals: SFCComponent[] = [];
    if (hasModal(pageConfig)) {
        const modalDir = genModalDir(pageConfig);

        pageConfig.relationModals.forEach((modal) => {
            if (modal.type === 'add') {
                modals.push(genAddModal(modal, modalDir));
            }
        });
    }

    return modals;
}
