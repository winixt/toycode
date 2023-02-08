<template>
    <div class="common-page">
        <FTable class="common-page-table" :data="dataSource">
            <FTableColumn prop="name" label="姓名" />
            <FTableColumn prop="age" label="年龄" />
            <FTableColumn prop="address" label="地址">
                <template #default="{ row }">
                    <div>
                        <span>{{ row.address }}</span>
                    </div>
                </template>
            </FTableColumn>
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
import { FTable, FTableColumn, FPagination } from '@fesjs/fes-design';
import { defineRouteMeta } from '@fesjs/fes';
import { useTable } from '@/common/use/useTable';

defineRouteMeta({
    name: 'pagerTable',
    title: '带翻页列表',
});

const { dataSource, pagination, changePage, changePageSize } = useTable({
    url: '/tablePage',
});
</script>
