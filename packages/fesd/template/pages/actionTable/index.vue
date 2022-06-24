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
                <FButton type="primary">
                    <template #icon>
                        <SearchOutlined />
                    </template>
                    查询
                </FButton>
                <FButton type="primary" @click="showAddModal">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    新增
                </FButton>
            </FFormItem>
        </FForm>
        <FTable class="common-page-table" :data="dataSource">
            <FTableColumn prop="name" label="姓名" />
            <FTableColumn prop="age" label="年龄" />
            <FTableColumn prop="address" label="地址" />
            <FTableColumn v-slot="{ row }" align="center" label="操作">
                <FButton type="link" @click="showEditModal">编辑</FButton>
                <FTooltip mode="confirm" @ok="confrimDelete(row)">
                    <FButton type="link">删除</FButton>
                    <template #title>
                        <div style="width: 200px">是否删除当前内容</div>
                    </template>
                </FTooltip>
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
    <AddModal v-model:visible="addModalVisible" />
    <EditModal v-model:visible="editModalVisible" />
</template>

<script setup>
import { reactive, ref } from 'vue';
import { FTable, FTableColumn, FForm, FFormItem, FInput, FButton, FPagination, FTooltip } from '@fesjs/fes-design';
import { PlusOutlined, SearchOutlined } from '@fesjs/fes-design/icon';
import { request, defineRouteMeta } from '@fesjs/fes';
import AddModal from './components/addModal.vue';
import EditModal from './components/editModal.vue';

defineRouteMeta({
    name: 'actionTable',
    title: '带操作列表',
});

const dataSource = ref([]);

const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    totalCount: 1000,
});

const queryDataSource = () => {
    request('/tablePage', {
        page: {
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
        },
    }).then(({ cycle, page }) => {
        dataSource.value = cycle;
        pagination.totalCount = page.totalCount;
    });
};

const changePage = (current) => {
    pagination.currentPage = current;
    queryDataSource();
};
const changePageSize = (pageSize) => {
    pagination.currentPage = 1;
    pagination.pageSize = pageSize;
    queryDataSource();
};

queryDataSource();

const confrimDelete = (row) => {
    console.log(row.name, '确认删除');
};

const addModalVisible = ref(false);
const showAddModal = () => {
    addModalVisible.value = true;
};

const editModalVisible = ref(false);
const showEditModal = () => {
    editModalVisible.value = true;
};
</script>
