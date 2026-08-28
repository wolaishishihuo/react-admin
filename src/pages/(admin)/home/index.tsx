import { Icon as SvgIcon } from '@iconify/react/offline';
import { Col, Row, Tabs, Table } from 'antd';
import { createFileRoute } from '@tanstack/react-router';
import ECharts from '@/components/ECharts';
import StatCardGrid, { type StatCardItem } from '@/components/StatCardGrid';
import { selectIsDark, useThemeStore } from '@/stores/modules/theme.store';
import { overviewTabs, overviewOptionsFn } from './modules/overview';
import { pieOptionsFn } from './modules/proportion';
import { columns, data } from './modules/table';
import './index.less';

export const Route = createFileRoute('/(admin)/home/')({
  component: HomePage,
  staticData: {
    title: '首页',
    keepAlive: false,
    menu: { icon: 'ri:home-smile-2-line', order: 1 },
    tab: { fixed: true, multi: false }
  }
});

function HomePage() {
  const isDark = useThemeStore(selectIsDark);

  return (
    <Row gutter={[15, 15]} className='analysis px-5px py-8px'>
      <Col span={24}>
        <StatCardGrid
          items={
            [
              {
                key: 'newCustomers',
                label: 'New Customers',
                value: 132893,
                icon: <SvgIcon icon='ri:user-3-line' />,
                accent: 'primary',
                extra: <span className='text-13px text-success'>+14.52%</span>
              },
              {
                key: 'activeUsers',
                label: 'Active Users',
                value: 219456,
                icon: <SvgIcon icon='ri:apps-line' />,
                accent: 'success',
                extra: <span className='text-13px text-success'>+58.36%</span>
              },
              {
                key: 'totalProfit',
                label: 'Total Profit',
                value: 854972,
                icon: <SvgIcon icon='ri:star-line' />,
                accent: 'warning',
                extra: <span className='text-13px text-success'>+36.28%</span>
              },
              {
                key: 'salesVolume',
                label: 'Sales Volume',
                value: 654932,
                icon: <SvgIcon icon='ri:table-line' />,
                accent: 'danger',
                extra: <span className='text-13px text-success'>+24.35%</span>
              }
            ] satisfies StatCardItem[]
          }
        />
      </Col>

      <Col span={24}>
        <Row gutter={[15, 15]} className='analysis-overview'>
          <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <div className='overview-box app-card flex flex-col h-500px'>
              <div className='overview-head px-38px pt-15px flex items-center justify-between'>
                <span className='overview-title text-23px text-content-tertiary mt-6px'>Product Sale Overview</span>
                <div className='overview-tabs'>
                  <Tabs defaultActiveKey='1' size='middle' items={overviewTabs} />
                </div>
              </div>
              <div className='overview-echarts flex-1'>
                <ECharts option={overviewOptionsFn(isDark)} />
              </div>
            </div>
          </Col>
        </Row>
      </Col>

      <Col span={24}>
        <Row gutter={[15, 15]}>
          <Col xl={16} lg={24} md={24} sm={24} xs={24}>
            <div className='app-card p-24px flex h-440px w-full'>
              <Table columns={columns} dataSource={data} pagination={false} size='middle' />
            </div>
          </Col>
          <Col xl={8} lg={24} md={24} sm={24} xs={24}>
            <div className='app-card p-24px h-440px w-full'>
              <ECharts option={pieOptionsFn(isDark)} />
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
