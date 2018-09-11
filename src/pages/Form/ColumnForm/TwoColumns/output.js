import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button } from 'antd';
import { Result, DescriptionList } from 'ant-design-pro';
import { isRespSucc, createErrExtra } from '@/utils/utils';
import {
  parseSexValue,
  parseDateTimeString,
  parseCascaderValues,
  parseAmtUppercase,
} from '@/utils/parse';

const { Description } = DescriptionList;

class TwoColumnsOutput extends PureComponent {
  render() {
    const { dispatch, routeid, twoColumns } = this.props;
    const { response, cityValues } = twoColumns[routeid];
    if (isRespSucc(response)) {
      const respData = response.data;
      const description = 'XXX信息建立成功';
      const extra = (
        <DescriptionList size="large" title="XXX信息">
          <Description term="用户名">{respData.username}</Description>
          <Description term="手机号码">{respData.phone}</Description>
          <Description term="邮箱地址">{respData.email}</Description>
          <Description term="姓名">{respData.actualName}</Description>
          <Description term="性别">{parseSexValue(respData.sex)}</Description>
          <Description term="出生日期">
            {parseDateTimeString(respData.parseBirthday, 'MM-DD-YYYY', 'YYYY年MM月DD日')}
          </Description>
          <Description term="所属城市">
            {parseCascaderValues(cityValues, respData.city)}
          </Description>
          <Description term="每月收入">{parseAmtUppercase(respData.income)}</Description>
          <Description term="备注">{respData.remark}</Description>
        </DescriptionList>
      );
      const actions = (
        <div>
          <Button type="primary">打印</Button>
          <Button
            type="primary"
            onClick={() => {
              dispatch({ type: 'two-columns/redo', routeid });
            }}
          >
            再做一笔
          </Button>
          <Button
            type="primary"
            onClick={() => {
              dispatch(routerRedux.push('/'));
            }}
          >
            返回主页
          </Button>
        </div>
      );
      return (
        <Result
          type="success"
          title="提交成功"
          description={description}
          extra={extra}
          actions={actions}
        />
      );
    } else {
      const extra = createErrExtra(response);
      const actions = (
        <div>
          <Button
            type="primary"
            onClick={() => {
              dispatch({ type: 'two-columns/back2edit' });
            }}
          >
            返回修改
          </Button>
        </div>
      );
      return <Result type="error" title="提交失败" extra={extra} actions={actions} />;
    }
  }
}

function mapStateToProps(state) {
  return {
    twoColumns: state['two-columns'],
  };
}

export default connect(mapStateToProps)(TwoColumnsOutput);
