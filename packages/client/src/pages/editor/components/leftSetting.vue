<template>
    <div class="left-setting">
        <FForm :labelWidth="80" labelPosition="top">
            <FFormItem label="Token">
                <FInput placeholder="API Design Token"></FInput>
            </FFormItem>
            <FFormItem label="Dev URL">
                <FInput placeholder="请输入开发环境URL"></FInput>
            </FFormItem>
        </FForm>
        <SearchBlock />
        <TableColumn />
    </div>
</template>

<script lang="ts">
import { FForm, FFormItem, FInput } from '@fesjs/fes-design';
import { defineComponent } from 'vue';
import TableColumn from './tableColumn.vue';
import SearchBlock from './searchBlock.vue';

export default defineComponent({
    components: {
        FForm,
        FFormItem,
        FInput,
        TableColumn,
        SearchBlock,
    },
    setup() {
        return {};
    },
});
</script>

<style lang="less" scoped>
.left-setting {
    width: 360px;
    padding: 12px;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}
</style>
