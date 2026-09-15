import { requestClient } from '#/api/request';

/** 业务管理接口(后台) */
export namespace BizAdminApi {
  export interface Letter {
    [key: string]: any;
    id?: number;
    senderId?: number;
    receiverId?: number;
    senderName?: string;
    receiverName?: string;
    title?: string;
    content?: string;
    status?: number;
    stampName?: string;
    envelopeName?: string;
    sendTime?: string;
    readTime?: string;
    sys001?: string;
  }

  export interface Friend {
    [key: string]: any;
    id?: number;
    userId?: number;
    friendId?: number;
    friendName?: string;
    friendAvatar?: string;
    status?: number;
    applyRemark?: string;
    addTime?: string;
    sys001?: string;
  }

  export interface Diary {
    [key: string]: any;
    id?: number;
    userId?: number;
    userName?: string;
    title?: string;
    content?: string;
    weather?: string;
    mood?: string;
    writeDate?: string;
    isPublic?: number;
    sys001?: string;
  }

  export interface Thought {
    [key: string]: any;
    id?: number;
    userId?: number;
    userName?: string;
    title?: string;
    content?: string;
    thoughtType?: string;
    isPublic?: number;
    sys001?: string;
  }

  export interface Note {
    [key: string]: any;
    id?: number;
    userId?: number;
    userName?: string;
    title?: string;
    content?: string;
    noteType?: string;
    isPublic?: number;
    sys001?: string;
  }

  export interface Stamp {
    [key: string]: any;
    id?: number;
    name: string;
    description?: string;
    imageUrl?: string;
    price: number;
    stock: number;
    stampType?: string;
    status?: number;
  }

  export interface Envelope {
    [key: string]: any;
    id?: number;
    name: string;
    description?: string;
    imageUrl?: string;
    price: number;
    stock: number;
    envelopeType?: string;
    status?: number;
  }

  export interface CoinLog {
    [key: string]: any;
    id?: number;
    userId?: number;
    userName?: string;
    changeAmount?: number;
    balanceAfter?: number;
    logType?: string;
    refId?: number;
    remark?: string;
    sys001?: string;
  }

  export interface Order {
    [key: string]: any;
    id?: number;
    userId?: number;
    userName?: string;
    itemType?: string;
    itemId?: number;
    itemName?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
    status?: number;
    sys001?: string;
  }
}

// ===== 信件 =====
export function getLetterAdminList(params: {
  page: number;
  limit: number;
  senderId?: number;
  receiverId?: number;
}) {
  return requestClient.get('/biz/letter/admin/list', { params });
}

// ===== 好友 =====
export function getFriendAdminList() {
  return requestClient.get('/biz/friend/admin/list');
}

// ===== 日记 =====
export function getDiaryAdminList(params: {
  page: number;
  limit: number;
  userId?: number;
  keyWord?: string;
}) {
  return requestClient.get('/biz/diary/admin/list', { params });
}

// ===== 感想 =====
export function getThoughtAdminList(params: {
  page: number;
  limit: number;
  userId?: number;
  keyWord?: string;
}) {
  return requestClient.get('/biz/thought/admin/list', { params });
}

// ===== 笔记 =====
export function getNoteAdminList(params: {
  page: number;
  limit: number;
  userId?: number;
  keyWord?: string;
}) {
  return requestClient.get('/biz/note/admin/list', { params });
}

// ===== 邮票 =====
export function getStampAdminList() {
  return requestClient.get('/biz/stamp/admin/list');
}

export function createStamp(data: BizAdminApi.Stamp) {
  return requestClient.post('/biz/stamp/admin/add', data);
}

export function updateStamp(data: BizAdminApi.Stamp) {
  return requestClient.post('/biz/stamp/admin/edit', data);
}

export function deleteStamp(id: number) {
  return requestClient.post(`/biz/stamp/admin/remove/${id}`);
}

// ===== 信封 =====
export function getEnvelopeAdminList() {
  return requestClient.get('/biz/envelope/admin/list');
}

export function createEnvelope(data: BizAdminApi.Envelope) {
  return requestClient.post('/biz/envelope/admin/add', data);
}

export function updateEnvelope(data: BizAdminApi.Envelope) {
  return requestClient.post('/biz/envelope/admin/edit', data);
}

export function deleteEnvelope(id: number) {
  return requestClient.post(`/biz/envelope/admin/remove/${id}`);
}

// ===== 铜钱 =====
export function getCoinAdminLogs(params: {
  page: number;
  limit: number;
  userId?: number;
  logType?: string;
}) {
  return requestClient.get('/biz/coin/admin/logs', { params });
}

export function getCoinAdminOrders(params: {
  page: number;
  limit: number;
  userId?: number;
  itemType?: string;
  status?: number;
}) {
  return requestClient.get('/biz/coin/admin/orders', { params });
}

export function adjustUserCoin(data: {
  userId: number;
  delta: number;
  remark?: string;
}) {
  return requestClient.post('/biz/coin/admin/adjust', data);
}
