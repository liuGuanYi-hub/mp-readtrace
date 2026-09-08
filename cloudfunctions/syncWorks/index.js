// 云函数模板：syncWorks
// 负责双端数据合并与拉取
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { action, works = [], lastSyncTime } = event;

  if (action === 'pull') {
    const res = await db.collection('rt_works')
      .where({ _openid: OPENID })
      .limit(1000)
      .get();
    return {
      success: true,
      works: res.data.map(item => item.data || item),
    };
  }

  if (action === 'push') {
    let count = 0;
    for (const item of works) {
      await db.collection('rt_works').doc(`${OPENID}_${item.id}`).set({
        data: {
          ...item,
          _openid: OPENID,
          serverUpdatedAt: db.serverDate(),
        }
      });
      count++;
    }
    return {
      success: true,
      updatedCount: count,
    };
  }

  return { success: false, message: '未知操作' };
};