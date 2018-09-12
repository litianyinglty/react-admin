import moment from 'moment';
import React from 'react';
import nzh from 'nzh/cn';
import { parse, stringify } from 'qs';
import { Modal, Icon } from 'antd';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  return nzh.toMoney(n);
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  }
  if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}

export function formatWan(val) {
  const v = val * 1;
  if (!v || Number.isNaN(v)) return '';

  let result = val;
  if (val > 10000) {
    result = Math.floor(val / 10000);
    result = (
      <span>
        {result}
        <span
          styles={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            lineHeight: 20,
            marginLeft: 2,
          }}
        >
          万
        </span>
      </span>
    );
  }
  return result;
}

export function isJsonString(str) {
  try {
    if (typeof JSON.parse(str) === 'object') {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}
// add by liaowei at 20180907

export function isCallSucc(response) {
  if (response == null) {
    return false;
  }
  return true;
}

export function isRespSucc(response) {
  if (response == null || response.code !== 'OK') {
    return false;
  }
  return true;
}

export function getError(response) {
  return `${response.code}#${response.message}`;
}

export function showErrorMsg(response) {
  if (response == null) {
    return;
  }
  Modal.error({
    title: <div>错误提示</div>,
    content: (
      <div style={{ marginTop: 16 }}>
        错误码：<span style={{ color: '#f5222d' }}>{response.code}</span>
        <br />
        错误信息：<span style={{ color: '#f5222d' }}>{response.message}</span>
      </div>
    ),
  });
}

export function getPropsValue(props, params, defaultValue = undefined) {
  let propsValue = props;
  params.every(param => {
    if (propsValue[param] == null) {
      propsValue = defaultValue;
      return false;
    }
    propsValue = propsValue[param];
    return true;
  });
  return propsValue;
}

export function thousandBitSeparator(num) {
  return parseFloat(num).toLocaleString('zh-cn');
}

export function createErrExtra(response) {
  let extraResponse = response;
  if (extraResponse == null) {
    extraResponse = {};
    extraResponse.code = 'EEEEEEE';
    extraResponse.message = '获取错误信息失败！';
  }
  const extra = (
    <div>
      <div
        style={{ fontSize: 16, color: 'rgba(0, 0, 0, 0.85)', fontWeight: '500', marginBottom: 16 }}
      >
        您提交的内容发生错误：
      </div>
      <div style={{ marginBottom: 16 }}>
        <Icon style={{ color: '#f5222d', marginRight: 8 }} type="close-circle-o" />
        错误码：
        <span style={{ color: '#f5222d' }}>{extraResponse.code}</span>
      </div>
      <div>
        <Icon style={{ color: '#f5222d', marginRight: 8 }} type="close-circle-o" />
        错误信息：<span style={{ color: '#f5222d' }}>{extraResponse.message}</span>
      </div>
    </div>
  );
  return extra;
}

export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    // eslint-disable-next-line
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createRouteid() {
  return guid();
}

export function createMomentObject(datetime, format) {
  if (datetime == null) {
    return undefined;
  }
  return moment(datetime, format);
}

export function isEmptyObject(object) {
  if (Object.keys(object).length === 0) {
    return true;
  }
  return false;
}
