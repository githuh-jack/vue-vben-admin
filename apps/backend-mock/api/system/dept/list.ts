import { faker } from '@faker-js/faker';
import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

const formatterCN = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function generateMockDataList() {
  const dataList: Record<string, any>[] = [
    {
      id: 100,
      parentId: 0,
      deptName: '总公司',
      sort: 0,
      leader: '管理员',
      phone: '13800000000',
      email: 'admin@aladdin.com',
      status: 1,
      sys001: '2026-01-01 00:00:00',
      sys002: '2026-01-01 00:00:00',
    },
  ];

  const subDepts = [
    { id: 101, deptName: '研发部', leader: '张三' },
    { id: 102, deptName: '市场部', leader: '李四' },
    { id: 103, deptName: '财务部', leader: '王五' },
    { id: 104, deptName: '运维部', leader: '赵六' },
  ];

  for (const dept of subDepts) {
    const deptItem: Record<string, any> = {
      id: dept.id,
      parentId: 100,
      deptName: dept.deptName,
      sort: dept.id - 100,
      leader: dept.leader,
      phone: faker.phone.number(),
      email: faker.internet.email(),
      status: 1,
      sys001: formatterCN.format(
        faker.date.between({ from: '2026-01-01', to: '2026-03-01' }),
      ),
      sys002: formatterCN.format(
        faker.date.between({ from: '2026-03-01', to: '2026-06-01' }),
      ),
    };

    // 随机添加子部门
    if (faker.datatype.boolean()) {
      deptItem.children = Array.from(
        { length: faker.number.int({ min: 1, max: 3 }) },
        (_, idx) => ({
          id: faker.number.int({ min: 200, max: 999 }),
          parentId: dept.id,
          deptName: `${dept.deptName}${['一组', '二组', '三组'][idx] || `${idx + 1}组`}`,
          sort: idx,
          leader: faker.person.fullName(),
          phone: faker.phone.number(),
          email: faker.internet.email(),
          status: faker.helpers.arrayElement([0, 1]),
          sys001: formatterCN.format(
            faker.date.between({ from: '2026-01-01', to: '2026-06-01' }),
          ),
          sys002: formatterCN.format(
            faker.date.between({ from: '2026-03-01', to: '2026-06-01' }),
          ),
        }),
      );
    }

    dataList.push(deptItem);
  }

  return dataList;
}

const mockData = generateMockDataList();

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const listData = structuredClone(mockData);
  return useResponseSuccess(listData);
});
