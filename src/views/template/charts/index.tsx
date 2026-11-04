import { Col, Row } from 'antd';
import type { ReactNode } from 'react';

import type { LineSeries, MapScatterDatum } from '@/components/Echarts/charts';
import {
  BarChart,
  DualBarCompareChart,
  KLineChart,
  LineChart,
  MapChart,
  RadarChart,
  RingChart,
  ScatterChart
} from '@/components/Echarts/charts';

const week = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月'];
const mapScatter: MapScatterDatum[] = [
  { name: '北京', value: [116.405285, 39.904989, 100] },
  { name: '上海', value: [121.472644, 31.231706, 100] },
  { name: '深圳', value: [114.085947, 22.547, 100] }
];

const multiLine: LineSeries[] = [
  { name: '销售额', data: [120, 132, 101, 134, 90, 130], areaStyle: { startOpacity: 0.1, endOpacity: 0 } },
  { name: '利润', data: [80, 92, 71, 94, 60, 80], areaStyle: { startOpacity: 0.1, endOpacity: 0 } }
];

const scatter = [
  [1, 3],
  [2, 4],
  [3, 5],
  [4, 6],
  [5, 7],
  [6, 8],
  [7, 7],
  [8, 9],
  [9, 8],
  [10, 6],
  [11, 7],
  [12, 8]
].map(value => ({ value }));

interface ChartPanelProps {
  title: string;
  children: ReactNode;
}

const ChartPanel = (props: ChartPanelProps) => {
  const { title, children } = props;
  return (
    <div className='card h-full' style={{ padding: 20 }}>
      <div className='text-base font-medium pb-3.5'>{title}</div>
      {children}
    </div>
  );
};

const ChartsPage = () => {
  return (
    <div className='pb-5 pt-1'>
      <h2 className='text-xl font-medium my-5'>图表</h2>
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='柱状图（单数据）'>
            <BarChart data={[120, 200, 150, 80, 70, 110, 130]} xAxisData={week} showLegend legendPosition='right' />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='柱状图（多组数据）'>
            <BarChart
              showLegend
              barWidth='26%'
              xAxisData={week}
              data={[
                { name: '销售额', data: [120, 200, 150, 80, 70, 110, 130] },
                { name: '利润', data: [20, 50, 30, 15, 10, 25, 35] }
              ]}
            />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='柱状图（堆叠）'>
            <BarChart
              showLegend
              stack
              barWidth='26%'
              xAxisData={['产品A', '产品B', '产品C', '产品D', '产品E']}
              data={[
                { name: 'Q1', data: [20, 25, 30, 35, 40], stack: 'total' },
                { name: 'Q2', data: [30, 35, 40, 45, 50], stack: 'total' }
              ]}
            />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='折线图'>
            <LineChart data={[58, 15, 82, 35, 120, 62, 45]} xAxisData={months} symbol='none' symbolSize={7} />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='折线图（渐变背景）'>
            <LineChart data={[28, 45, 82, 35, 100, 32, 55]} xAxisData={months} showAreaColor />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='折线图（多组数据）'>
            <LineChart showLegend data={multiLine} xAxisData={['1月', '2月', '3月', '4月', '5月', '6月']} />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='柱状图（水平）'>
            <BarChart horizontal data={[50, 80, 120, 90, 60]} xAxisData={['产品A', '产品B', '产品C', '产品D', '产品E']} />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='柱状图（水平多组）'>
            <BarChart
              horizontal
              showLegend
              barWidth='30%'
              xAxisData={['类目1', '类目2', '类目3']}
              data={[
                { name: '系列1', data: [10, 20, 30] },
                { name: '系列2', data: [15, 25, 35] }
              ]}
            />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='柱状图（水平堆叠）'>
            <BarChart
              horizontal
              showLegend
              stack
              barWidth='30%'
              xAxisData={['类目1', '类目2', '类目3']}
              data={[
                { name: '系列1', data: [10, 20, 30] },
                { name: '系列2', data: [15, 25, 35] }
              ]}
            />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='环形图'>
            <RingChart
              legendPosition='bottom'
              radius={['54%', '70%']}
              data={[
                { value: 35, name: '分类A' },
                { value: 28, name: '分类B' },
                { value: 42, name: '分类C' }
              ]}
            />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='环形图（中心文字）'>
            <RingChart
              showLegend
              legendPosition='bottom'
              centerText='¥300,458'
              radius={['54%', '70%']}
              borderRadius={0}
              data={[
                { value: 35, name: '分类A' },
                { value: 28, name: '分类B' },
                { value: 42, name: '分类C' },
                { value: 32, name: '分类D' },
                { value: 26, name: '分类E' },
                { value: 37, name: '分类F' }
              ]}
            />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='饼图'>
            <RingChart
              showLegend
              legendPosition='right'
              radius={['0%', '70%']}
              data={[
                { value: 30, name: '分类A' },
                { value: 25, name: '分类B' },
                { value: 45, name: '分类C' }
              ]}
            />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='散点图'>
            <ScatterChart data={scatter} />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='雷达图'>
            <RadarChart
              indicator={[
                { name: '销售', max: 100 },
                { name: '管理', max: 100 },
                { name: '技术', max: 100 },
                { name: '客服', max: 100 },
                { name: '开发', max: 100 }
              ]}
              data={[
                { name: '预算分配', value: [80, 70, 90, 85, 75] },
                { name: '实际开销', value: [70, 75, 85, 80, 70] }
              ]}
            />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='K 线图'>
            <KLineChart
              data={[
                { time: '2024-01-01', open: 20, close: 23, high: 25, low: 18 },
                { time: '2024-01-02', open: 23, close: 21, high: 24, low: 20 },
                { time: '2024-01-03', open: 21, close: 25, high: 26, low: 21 }
              ]}
            />
          </ChartPanel>
        </Col>
        <Col xs={24} lg={12} xl={8}>
          <ChartPanel title='双向堆叠柱状图'>
            <DualBarCompareChart
              positiveData={[50, 28, 80, 65, 68, 70, 60, 55]}
              negativeData={[50, 28, 40, 45, 38, 50, 42, 48]}
              xAxisData={['0-4岁', '5-14岁', '15-24岁', '25-34岁', '35-44岁', '45-54岁', '55-64岁', '65岁以上']}
              positiveName='男性年龄分布'
              negativeName='女性年龄分布'
            />
          </ChartPanel>
        </Col>
      </Row>
      <div className='mt-5'>
        <ChartPanel title='地图'>
          <MapChart height='32rem' scatterData={mapScatter} />
        </ChartPanel>
      </div>
    </div>
  );
};

export default ChartsPage;
