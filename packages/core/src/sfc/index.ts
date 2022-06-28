import { isEmpty } from 'lodash-es';
import { join } from 'path';
import { genImportCode } from '../utils';
import {
    SFCComponent,
    Component,
    ComponentProps,
    ExtensionType,
    ComponentEvents,
    ComponentDirectives,
    ComponentSlots,
    ComponentSlot,
    PreChangeFile,
    ImportSource,
} from '../type';

function compileProps(props?: ComponentProps) {
    if (!props) {
        return '';
    }
    return Object.keys(props)
        .map((key) => {
            const prop = props[key];
            if (prop.type === ExtensionType.JSExpression) {
                return `:${key}="${prop.value}"`;
            }
            if (prop.type === 'boolean' && prop.value) {
                return `${key}`;
            }
            if (prop.type === 'boolean' && !prop.value) {
                return `:${key}="false"`;
            }
            if (prop.type === 'number') {
                return `:${key}="${prop.value}"`;
            }
            if (prop.value) {
                return `${key}="${prop.value}"`;
            }
            return '';
        })
        .join(' ');
}

function compileEvents(events?: ComponentEvents) {
    if (!events) {
        return '';
    }
    return Object.keys(events)
        .map((key) => {
            const value = events[key];
            if (value) {
                return `@${key}="${value}"`;
            }
            return '';
        })
        .join(' ');
}

function compileDirectives(directives?: ComponentDirectives) {
    if (!directives) {
        return '';
    }
    return Object.keys(directives)
        .map((key) => {
            const value = directives[key];
            if (value) {
                return `${key}="${value}"`;
            }
            return '';
        })
        .join(' ');
}

function compileSlots(slots: ComponentSlots): string[] {
    return slots.slots.map((item: ComponentSlot) => {
        if (item.scoped) {
            return `<template #${item.name}="${item.scoped}">
            ${compileComponent(item.component)}
        </template>`;
        }
        return `<template #${item.name}>
            ${compileComponent(item.component)}
        </template>`;
    });
}

function compileComponent(component: Component): string {
    return `<${component.componentName} ${compileDirectives(
        component.directives,
    )} ${compileProps(component.props)} ${compileEvents(component.events)} ${
        !isEmpty(component.children) || !isEmpty(component.slots)
            ? `>
                ${
                    component.children
                        ? component.children.map(compileComponent)
                        : ''
                }
                ${component.slots ? compileSlots(component.slots) : ''}
                </${component.componentName}>`
            : ' />'
    }`;
}

function genPropsDefinition(sfc: SFCComponent) {
    if (!isEmpty(sfc.propsDefinition)) {
        const props = sfc.propsDefinition.map((item) => {
            return `${item.name}: ${item.propType}`;
        });
        const propsDefaultValue = sfc.propsDefinition
            .filter((item) => item.defaultValue != null)
            .map((item) => {
                return `${item.name}: ${item.defaultValue}`;
            });
        return `
        const props = withDefaults(defineProps({
            ${props.join(',')}
        }), {
            ${propsDefaultValue.join(',')}
        })
        `;
    }
    return '';
}

function genEmitsDefinition(sfc: SFCComponent) {
    if (!isEmpty(sfc.emitsDefinition)) {
        if (Array.isArray(sfc.emitsDefinition)) {
            return `
            const emit = defineEmits([${sfc.emitsDefinition.join(', ')}])
            `;
        }
        return `
        const emit = defineEmits({
            ${Object.keys(sfc.emitsDefinition)
                .map((key: string) => {
                    return `${key}: ${sfc.emitsDefinition[key as any]}`;
                })
                .join(', ')}
        })
        `;
    }
    return '';
}

function genSetupCode(sfc: SFCComponent) {
    const importSources = genImportCode(
        sfc.setupCodes.reduce((acc, cur) => {
            return acc.concat(cur.importSources);
        }, [] as ImportSource[]),
    );

    return `
    <script setup>
    ${importSources}
    
    ${genPropsDefinition(sfc)}
    ${genEmitsDefinition(sfc)}

    ${sfc.setupCodes.map((item) => item.content).join('\n')}
    </script>
    `;
}

// TODO 支持独立 css 文件
function genStyle(sfc: SFCComponent) {
    const css = sfc.css;
    if (!css) return '';
    return `<style lang="${css.lang}" ${css.scoped ? 'scoped' : ''}>
    ${css.content}
    </style>`;
}

export function compileSFC(sfc: SFCComponent): PreChangeFile {
    return {
        file: join(sfc.dir || '', sfc.fileName),
        content: `
        <template>
            ${sfc.children.map(compileComponent).join('\n')}
        </template>

        ${genSetupCode(sfc)}

        ${genStyle(sfc)}
        `,
    };
}
