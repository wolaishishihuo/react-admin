import './index.css';
import { Col, Row, Table, Tabs } from 'antd';

import MetricChartCard from '@/components/Echarts/cards/MetricChartCard';
import { LineChart, RingChart } from '@/components/Echarts/charts';

import { overviewData, overviewMonths, overviewTabs } from './config/overview';
import { proportionData } from './config/proportion';
import { columns, data } from './config/table';
import { metricCards } from './config/trend';

const Analysis = () => {
  return (
    <Row gutter={[15, 15]} className='analysis'>
      {/* analysis-count */}
      <Col span={24}>
        <Row gutter={[20, 20]}>
          {metricCards.map(item => (
            <Col key={item.id} xxl={6} xl={12} lg={12} md={24} sm={24} xs={24}>
              <MetricChartCard
                mini
                chart='line'
                showArea
                height={9.5}
                value={item.value}
                label={item.label}
                percentage={item.percentage}
                data={item.data}
              />
            </Col>
          ))}
        </Row>
      </Col>

      {/* analysis-overview */}
      <Col span={24}>
        <Row gutter={[15, 15]} className='analysis-overview'>
          <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <div className='overview-box card'>
              <div className='overview-head'>
                <span className='overview-title'>Product Sale Overview</span>
                <div className='overview-tabs'>
                  <Tabs defaultActiveKey='1' size='middle' items={overviewTabs} />
                </div>
              </div>
              <div className='overview-echarts'>
                <LineChart data={overviewData} xAxisData={overviewMonths} height='100%' showAreaColor />
              </div>
            </div>
          </Col>
        </Row>
      </Col>

      {/* analysis-record */}
      <Col span={24}>
        <Row gutter={[15, 15]} className='analysis-record'>
          <Col xl={16} lg={24} md={24} sm={24} xs={24}>
            <div className='record-table card'>
              <Table columns={columns} dataSource={data} pagination={false} size='middle' />
            </div>
          </Col>
          <Col xl={8} lg={24} md={24} sm={24} xs={24}>
            <div className='record-proportion card'>
              <RingChart
                data={proportionData}
                height='100%'
                centerText='Active Users'
                showLegend
                legendPosition='bottom'
                radius={['42%', '72%']}
              />
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Analysis;
