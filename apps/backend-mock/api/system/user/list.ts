import { faker } from '@faker-js/faker';
import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';

const formatterCN = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function generateMockDataList(count: number) {
  const dataList = [];

  for (let i = 0; i < count; i++) {
    const dataItem: Record<string, any> = {
      id: i + 1,
      username: faker.internet.username(),
      nickname: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      avatar: '',
      deptId: faker.number.int({ min: 100, max: 110 }),
      deptName: faker.commerce.department(),
      status: faker.helpers.arrayElement([0, 1]),
      pwdForceChange: faker.helpers.arrayElement([0, 1]),
      tenantId: 1,
      sys001: formatterCN.format(
        faker.date.between({ from: '2022-01-01', to: '2026-01-01' }),
      ),
      sys002: formatterCN.format(
        faker.date.between({ from: '2026-01-01', to: '2026-06-01' }),
      ),
    };

    dataList.push(dataItem);
  }

  return dataList;
}

const mockData = generateMockDataList(100);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const {
    page = 1,
    pageSize = 20,
    username,
    status,
    deptId,
  } = getQuery(event);
  let listData = structuredClone(mockData);
  if (username) {
    listData = listData.filter((item) =>
      item.username.toLowerCase().includes(String(username).toLowerCase()),
    );
  }
  if (['0', '1'].includes(status as string)) {
    listData = listData.filter((item) => item.status === Number(status));
  }
  if (deptId) {
    listData = listData.filter((item) => String(item.deptId) === String(deptId));
  }
  return usePageResponseSuccess(page as string, pageSize as string, listData);
});
