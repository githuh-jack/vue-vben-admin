import { requestClient } from '#/api/request';

/** 字典类型接口 */
export namespace SystemDictTypeApi {
  /** 字典类型实体 */
  export interface DictType {
    [key: string]: any;
    id?: number;
    /** 字典名称 */
    dictName: string;
    /** 字典类型(唯一) */
    dictType: string;
    /** 状态 0停用 1启用 */
    status: number;
  }
}

/** 字典数据接口 */
export namespace SystemDictDataApi {
  /** 字典数据实体 */
  export interface DictData {
    [key: string]: any;
    id?: number;
    /** 字典类型ID */
    dictTypeId: number;
    /** 字典标签 */
    dictLabel: string;
    /** 字典键值 */
    dictValue: string;
    /** 排序 */
    sort: number;
    /** 样式属性 */
    cssClass?: string;
    /** 列表样式 */
    listClass?: string;
    /** 状态 0停用 1启用 */
    status: number;
  }
}

// ===== 字典类型 =====

/** 分页查询字典类型 */
export function getDictTypeList(params: { page: number; limit: number; dictName?: string; status?: number }) {
  return requestClient.get('/system/dict/type/list', { params });
}

/** 获取字典类型详情 */
export function getDictTypeById(id: number) {
  return requestClient.get<SystemDictTypeApi.DictType>(`/system/dict/type/detail/${id}`);
}

/** 根据字典类型获取字典类型 */
export function getDictTypeByType(dictType: string) {
  return requestClient.get<SystemDictTypeApi.DictType>(`/system/dict/type/type/${dictType}`);
}

/** 新增字典类型 */
export function createDictType(data: Omit<SystemDictTypeApi.DictType, 'id'>) {
  return requestClient.post('/system/dict/type', data);
}

/** 修改字典类型 */
export function updateDictType(data: SystemDictTypeApi.DictType) {
  return requestClient.post('/system/dict/type/edit', data);
}

/** 删除字典类型 */
export function deleteDictType(id: number) {
  return requestClient.post(`/system/dict/type/remove/${id}`);
}

// ===== 字典数据 =====

/** 查询字典数据列表 */
export function getDictDataList(params: { dictTypeId: number; page?: number; limit?: number }) {
  return requestClient.get('/system/dict/data/list', { params });
}

/** 获取字典数据详情 */
export function getDictDataById(id: number) {
  return requestClient.get<SystemDictDataApi.DictData>(`/system/dict/data/detail/${id}`);
}

/** 根据字典类型获取字典数据 */
export function getDictDataByType(dictType: string) {
  return requestClient.get<SystemDictDataApi.DictData[]>(`/system/dict/data/type/${dictType}`);
}

/** 新增字典数据 */
export function createDictData(data: Omit<SystemDictDataApi.DictData, 'id'>) {
  return requestClient.post('/system/dict/data', data);
}

/** 修改字典数据 */
export function updateDictData(data: SystemDictDataApi.DictData) {
  return requestClient.post('/system/dict/data/edit', data);
}

/** 删除字典数据 */
export function deleteDictData(id: number) {
  return requestClient.post(`/system/dict/data/remove/${id}`);
}

/** 刷新字典缓存 */
export function refreshDictCache() {
  return requestClient.post('/system/dict/data/refreshCache');
}
