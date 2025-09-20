import type { Meta, StoryObj } from '@storybook/react';
import CapacityChart from './CapacityChart';
import { type CapacityDatum } from '../../lib/capacityUtils';

const meta: Meta<typeof CapacityChart> = {
  title: 'Charts/CapacityChart',
  component: CapacityChart,
  argTypes: {
    height: { control: { type: 'number', min: 120, max: 600, step: 20 } },
    loading: { control: 'boolean' },
    error: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CapacityChart>;

const sampleData: CapacityDatum[] = [
  { resourceName: 'Alice', week: '2025-01-06', allocated: 4.5, capacity: 4.5 },
  { resourceName: 'Bob', week: '2025-01-06', allocated: 3.2, capacity: 4.5 },
  { resourceName: 'Charlie', week: '2025-01-06', allocated: 5.1, capacity: 4.5 },
];

export const Default: Story = {
  args: {
    data: sampleData,
    height: 280,
  },
};

export const Loading: Story = {
  args: {
    data: [],
    loading: true,
  },
};

export const Error: Story = {
  args: {
    data: [],
    error: 'Failed to load capacity data',
  },
};

export const Empty: Story = {
  args: {
    data: [],
  },
};

export const Tall: Story = {
  args: {
    data: sampleData,
    height: 420,
  },
};


