import { Col, Row } from 'antd';
import type { ReactNode } from 'react';

import { message } from '@/hooks/useMessage';

import DataListCard from './components/DataListCard';
import DonutChartCard from './components/DonutChartCard';
import MetricChartCard from './components/MetricChartCard';
import ProgressCard from './components/ProgressCard';
import StatsCard from './components/StatsCard';
import TimelineListCard from './components/TimelineListCard';

const statsCards = [
  {
    id: 'sales',
    title: '销售产品',
    count: 1235,
    description: '鞋子、牛仔裤、派对服装、手表',
    icon: 'ri:bar-chart-box-line',
    iconClassName: 'bg-primary text-white',
    plainIconClassName: 'bg-primary/10 text-primary text-3xl',
    boxStyle: { background: 'color-mix(in srgb, var(--hooks-colorPrimary) 10%, var(--hooks-colorBgBox))' },
    textColor: 'var(--hooks-colorPrimary)'
  },
  {
    id: 'users',
    title: '活跃用户',
    count: 5000,
    description: '日活跃用户超过 5,000+',
    icon: 'ri:account-box-2-line',
    iconClassName: 'bg-warning text-white',
    plainIconClassName: 'bg-warning/10 text-warning text-3xl',
    boxStyle: { background: 'color-mix(in srgb, var(--hooks-colorWarning) 10%, var(--hooks-colorBgBox))' },
    textColor: 'var(--hooks-colorWarning)'
  },
  {
    id: 'income',
    title: '总收入',
    count: 35000,
    description: '月收入超过 ¥350,000+',
    icon: 'ri:money-cny-box-line',
    iconClassName: 'bg-[var(--hooks-colorInfo)] text-white',
    plainIconClassName: 'bg-[var(--hooks-colorInfo)]/10 text-[var(--hooks-colorInfo)] text-3xl',
    boxStyle: { background: 'color-mix(in srgb, var(--hooks-colorInfo) 10%, var(--hooks-colorBgBox))' },
    textColor: 'var(--hooks-colorInfo)'
  },
  {
    id: 'review',
    title: '客户评价',
    count: 4800,
    description: '平均评分 4.8/5',
    icon: 'ri:message-3-line',
    iconClassName: 'bg-[var(--hooks-colorError)] text-white',
    plainIconClassName: 'bg-[var(--hooks-colorError)]/10 text-[var(--hooks-colorError)] text-3xl',
    boxStyle: { background: 'color-mix(in srgb, var(--hooks-colorError) 10%, var(--hooks-colorBgBox))' },
    textColor: 'var(--hooks-colorError)'
  }
];

const progressCards = [
  {
    id: 'done',
    title: '完成进度',
    percentage: 75,
    color: 'var(--hooks-colorSuccess)',
    icon: 'ri:arrow-up-circle-line',
    iconClassName: 'bg-success/12 text-success'
  },
  {
    id: 'project',
    title: '项目进度',
    percentage: 65,
    color: 'var(--hooks-colorPrimary)',
    icon: 'ri:twitch-line',
    iconClassName: 'bg-primary/12 text-primary'
  },
  {
    id: 'study',
    title: '学习进度',
    percentage: 45,
    color: 'var(--hooks-colorError)',
    icon: 'ri:game-line',
    iconClassName: 'bg-[var(--hooks-colorError)]/12 text-[var(--hooks-colorError)]'
  },
  {
    id: 'task',
    title: '任务进度',
    percentage: 90,
    color: 'var(--hooks-colorInfo)',
    icon: 'ri:flag-2-line',
    iconClassName: 'bg-[var(--hooks-colorInfo)]/12 text-[var(--hooks-colorInfo)]'
  }
];

const dataList = [
  {
    id: 'trip',
    title: '新加坡之行',
    status: '进行中',
    time: '5分钟',
    icon: 'ri:camera-4-line',
    iconClassName: 'bg-primary/12 text-primary'
  },
  {
    id: 'archive',
    title: '归档数据',
    status: '进行中',
    time: '10分钟',
    icon: 'ri:bar-chart-box-line',
    iconClassName: 'bg-[var(--hooks-colorInfo)]/12 text-[var(--hooks-colorInfo)]'
  },
  {
    id: 'meeting',
    title: '客户会议',
    status: '待处理',
    time: '15分钟',
    icon: 'ri:user-3-line',
    iconClassName: 'bg-warning/12 text-warning'
  },
  {
    id: 'team',
    title: '筛选任务团队',
    status: '进行中',
    time: '20分钟',
    icon: 'ri:account-circle-line',
    iconClassName: 'bg-[var(--hooks-colorError)]/12 text-[var(--hooks-colorError)]'
  },
  {
    id: 'mail',
    title: '发送信封给小王',
    status: '已完成',
    time: '20分钟',
    icon: 'ri:message-3-line',
    iconClassName: 'bg-success/12 text-success'
  }
];

const timeline = [
  { id: 'pay-in', time: '上午 09:30', color: '#49beff', content: '收到 John Doe 支付的 385.90 美元' },
  { id: 'sale', time: '上午 10:00', color: '#369eff', content: '新销售记录', code: 'ML-3467' },
  { id: 'pay-out', time: '上午 12:00', color: '#67e8cf', content: '向 Michael 支付了 64.95 美元' },
  { id: 'maintain', time: '下午 14:30', color: '#ffc107', content: '系统维护通知', code: 'MT-2023' },
  { id: 'cancel', time: '下午 15:45', color: '#ff6969', content: '紧急订单取消提醒', code: 'OR-9876' },
  { id: 'report', time: '下午 17:00', color: '#67e8cf', content: '完成每日销售报表' }
];

const SectionTitle = (props: { children: ReactNode }) => {
  const { children } = props;
  return <h2 className='text-xl font-medium my-5 first:mt-0'>{children}</h2>;
};

const CardsPage = () => {
  return (
    <div className='pb-5'>
      <SectionTitle>统计卡片（文字）</SectionTitle>
      <Row gutter={[20, 20]}>
        {statsCards.map(card => (
          <Col key={card.id} xs={24} sm={12} xl={6}>
            <StatsCard icon={card.icon} iconClassName={card.iconClassName} title={card.title} description={card.description} />
          </Col>
        ))}
      </Row>

      <SectionTitle>统计卡片（数字滚动）</SectionTitle>
      <Row gutter={[20, 20]}>
        {statsCards.map(card => (
          <Col key={card.id} xs={24} sm={12} xl={6}>
            <StatsCard icon={card.icon} iconClassName={card.iconClassName} count={card.count} description={card.description} />
          </Col>
        ))}
      </Row>

      <SectionTitle>统计卡片（自定义样式）</SectionTitle>
      <Row gutter={[20, 20]}>
        {statsCards.map(card => (
          <Col key={card.id} xs={24} sm={12} xl={6}>
            <StatsCard
              icon={card.icon}
              iconClassName={card.plainIconClassName}
              title={card.title}
              description={card.description}
              textColor={card.textColor}
              boxStyle={card.boxStyle}
            />
          </Col>
        ))}
      </Row>

      <SectionTitle>进度卡片</SectionTitle>
      <Row gutter={[20, 20]}>
        {progressCards.map(card => (
          <Col key={card.id} xs={24} sm={12} xl={6}>
            <ProgressCard percentage={card.percentage} title={card.title} color={card.color} />
          </Col>
        ))}
      </Row>

      <SectionTitle>进度卡片（图标）</SectionTitle>
      <Row gutter={[20, 20]}>
        {progressCards.map(card => (
          <Col key={card.id} xs={24} sm={12} xl={6}>
            <ProgressCard
              percentage={card.percentage}
              title={card.title}
              color={card.color}
              icon={card.icon}
              iconClassName={card.iconClassName}
            />
          </Col>
        ))}
      </Row>

      <SectionTitle>图表卡片（小图表）</SectionTitle>
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} xl={6}>
          <MetricChartCard
            mini
            value={2545}
            label='新用户'
            date='过去 7 天'
            percentage={1.2}
            height={9.5}
            chart='line'
            data={[120, 132, 101, 134, 90, 230, 210]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricChartCard
            mini
            value={15480}
            label='浏览量'
            date='过去 14 天'
            percentage={-4.15}
            height={9.5}
            chart='bar'
            barWidth='45%'
            data={[120, 100, 150, 140, 90, 120, 130]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricChartCard
            mini
            value={2545}
            label='粉丝数'
            date='过去 30 天'
            percentage={1.2}
            height={9.5}
            chart='line'
            showArea
            data={[150, 180, 160, 200, 180, 220, 240]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <DonutChartCard
            value={36358}
            title='粉丝量'
            percentage={18}
            percentageLabel='较去年'
            data={[50, 40]}
            height={9.5}
            currentValue='2022'
            previousValue='2021'
            radius={['50%', '70%']}
          />
        </Col>
      </Row>

      <SectionTitle>图表卡片（大图表）</SectionTitle>
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} xl={6}>
          <MetricChartCard
            value={2545}
            label='新用户'
            percentage={1.2}
            height={11}
            chart='line'
            data={[120, 132, 101, 134, 90, 230, 210]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricChartCard
            value={15480}
            label='浏览量'
            percentage={-4.15}
            height={11}
            chart='bar'
            data={[120, 100, 150, 140, 90, 120, 130, 110]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricChartCard
            value={2545}
            label='粉丝数'
            percentage={1.2}
            height={11}
            chart='line'
            showArea
            data={[150, 180, 160, 200, 180, 220, 240]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <DonutChartCard
            value={36358}
            title='粉丝量'
            percentage={-18}
            percentageLabel='较 2021 年'
            data={[70, 30]}
            height={11}
            currentValue='12月'
            previousValue='11月'
          />
        </Col>
      </Row>

      <SectionTitle>数据列表卡片</SectionTitle>
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={8}>
          <DataListCard list={dataList} title='待办事项' subtitle='今日待处理任务' />
        </Col>
        <Col xs={24} lg={8}>
          <DataListCard
            list={dataList}
            maxCount={4}
            title='最近活动'
            subtitle='近期活动列表'
            showMore
            onMore={() => message.info('查看更多')}
          />
        </Col>
        <Col xs={24} lg={8}>
          <TimelineListCard list={timeline} title='最近交易' subtitle='2024年12月20日' />
        </Col>
      </Row>
    </div>
  );
};

export default CardsPage;
