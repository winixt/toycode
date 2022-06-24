<template>
    <div class="common-page">
        <FTable class="common-page-table" :data="dataSource">
            <FTableColumn prop="name" label="姓名" />
            <FTableColumn prop="age" label="年龄" />
            <FTableColumn prop="address" label="地址" />
            <FTableColumn prop="statusText" label="状态" />
        </FTable>
    </div>
</template>

<script setup>
import { FTable, FTableColumn } from '@fesjs/fes-design';
import { defineRouteMeta } from '@fesjs/fes';
import { getTargetLabel } from '@/common/utils';
import { useSimpleTable } from '@/common/use/useTable';

defineRouteMeta({
    name: 'simpleTable',
    title: '简单列表页面',
});

const STATUS = [
    {
        value: 0,
        label: '无效',
    },
    {
        value: 1,
        label: '有效',
    },
];

const { dataSource } = useSimpleTable({
    url: '/simpleTable',
    dataField: 'cycle',
    transform(data) {
        return data.map((item) => {
            item.statusText = getTargetLabel(STATUS, item.status);
            return item;
        });
    },
});
</script>
