import { isEmpty } from '@bmos/utils';
import { ref, watch } from 'vue';

export const useSearch = (searchTreeState, emit, props) => {
  // 搜索的值
  const searchValue = ref<string>('');

  const { 
    curTreeData, // 显示的树形数据
    fieldNamesRef, // 字段名
    dataList, // 扁平化数据
    idMap // id映射
   } = searchTreeState;

  const buildTreeData = (data, parentId) => {
    let children = data.filter((item) => item.parentId === parentId) || [];
    children.forEach((item) => {
      item.children = buildTreeData(data, item[fieldNamesRef.value.key]);
    });
    return children;
  };

  const expandKeys = ref([]);

  // 根据ID递归筛选目录
  function recursionFilterHelpDocCatalog(resList, key, unshift) {
    let info = idMap.value.get(key);
    if (!info || resList.some((e) => e[fieldNamesRef.value.key] === key)) {
      return;
    }
    if (unshift) {
      resList.unshift(info);
    } else {
      resList.push(info);
    }
    expandKeys.value.push(info[fieldNamesRef.value.key]);
    if (!isEmpty(info.parentId)) {
      recursionFilterHelpDocCatalog(resList, info.parentId, unshift);
    }
  }

  const handleSearch = (value) => {
    if (!props.treeData?.length) return;

    let originData = [...dataList.value];
    if (!value) {
      expandKeys.value = [];
      curTreeData.value = buildTreeData(originData, props.treeData[0].parentId);
      innerPropsRef.value.expandedKeys = expandKeys.value;
      emit('update:expanded-keys', expandKeys.value);
      innerPropsRef.value.autoExpandParent = true;
      return;
    }
    if (!originData) {
      return;
    }
    expandKeys.value = [];
    let filterItems = originData.filter((e) => e[fieldNamesRef.value.title].indexOf(searchValue.value) > -1);
    let filterList = [];
    // 循环筛选出的目录 构建目录树
    filterItems.forEach((e) => {
      recursionFilterHelpDocCatalog(filterList, e[fieldNamesRef.value.key], false);
    });

    curTreeData.value = buildTreeData(filterList, props.treeData[0].parentId);
    innerPropsRef.value.expandedKeys = expandKeys.value;
    emit('update:expanded-keys', expandKeys.value);
    searchValue.value = value;
    innerPropsRef.value.autoExpandParent = true;
  };
  watch(searchValue, value => {
    handleSearch(value);
  });

  return {
    searchValue,
    handleSearch,
  };
};
