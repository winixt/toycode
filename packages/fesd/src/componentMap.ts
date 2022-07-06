const COMPONENT_MAP: Record<
    string,
    { name: string; props: Record<string, any>; subName?: string }
> = {
    input: {
        name: 'Input',
        props: {},
    },
    select: {
        name: 'FSelect',
        subName: 'FOption',
        props: {},
    },
    textarea: {
        name: 'FInput',
        props: {
            type: 'textarea',
        },
    },
    inputNumber: {
        name: 'FInputNumber',
        props: {},
    },
    checkbox: {
        name: 'FCheckboxGroup',
        subName: 'FCheckbox',
        props: {},
    },
    radio: {
        name: 'FRadioGroup',
        subName: 'FRadio',
        props: {},
    },
    datePicker: {
        name: 'FDatePicker',
        props: {},
    },
    timePicker: {
        name: 'FTimePicker',
        props: {},
    },
};

export function componentMap(component: string) {
    return COMPONENT_MAP[component as keyof typeof COMPONENT_MAP];
}
