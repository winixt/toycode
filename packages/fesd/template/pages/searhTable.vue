<template>
    <div class="common-page">
        <FForm class="common-page-form" layout="inline">
            <FFormItem label="用户名">
                <FInput placeholder="请输入用户名" />
            </FFormItem>
            <FFormItem label="部门">
                <FInput placeholder="请输入部门" />
            </FFormItem>
            <FFormItem>
                <FButton type="primary">查询</FButton>
                <FButton type="primary">导出</FButton>
            </FFormItem>
        </FForm>
        <FTable class="common-page-table" :data="dataSource">
            <FTableColumn prop="name" label="姓名" />
            <FTableColumn prop="age" label="年龄" />
            <FTableColumn prop="address" label="地址" />
        </FTable>
        <FPagination
            class="common-page-pagination"
            :current-page="pagination.currentPage"
            :total-count="pagination.totalCount"
            :pageSize="pagination.pageSize"
            show-size-changer
            show-total
            @change="changePage"
            @page-size-change="changePageSize"
        />
    </div>
</template>

<script setup>
import { FTable, FTableColumn, FForm, FFormItem, FInput, FButton, FPagination } from '@fesjs/fes-design';
import { defineRouteMeta } from '@fesjs/fes';
import { useTable } from '@/common/use/useTable';

defineRouteMeta({
    name: 'searchTable',
    title: '带搜索列表',
});

const { dataSource, pagination, changePage, changePageSize } = useTable({
    url: '/tablePage',
});
</script>
