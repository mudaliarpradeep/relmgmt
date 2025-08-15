import type { Meta, StoryObj } from '@storybook/react';
import ConflictsChart from './ConflictsChart';
import type { AllocationConflictResponse } from '../../services/api/v1/allocationService';

const meta: Meta<typeof ConflictsChart> = {
  title: 'Charts/ConflictsChart',
  component: ConflictsChart,
  argTypes: {
    height: { control: { type: 'number', min: 120, max: 600, step: 20 } },
    loading: { control: 'boolean' },
    error: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ConflictsChart>;

const sampleConflicts: AllocationConflictResponse[] = [
  {
    resourceId: 7,
    resourceName: 'John Doe',
    weeklyConflicts: [
      { weekStarting: '2025-01-06', totalAllocation: 6.0, maxAllocation: 4.5, overAllocation: 1.5 },
      { weekStarting: '2025-01-13', totalAllocation: 5.2, maxAllocation: 4.5, overAllocation: 0.7 },
    ],
  },
  {
    resourceId: 8,
    resourceName: 'Jane Smith',
    weeklyConflicts: [
      { weekStarting: '2025-01-06', totalAllocation: 4.6, maxAllocation: 4.5, overAllocation: 0.1 },
    ],
  },
];

export const Default: Story = {
  args: {
    conflicts: sampleConflicts,
    height: 280,
  },
};

export const Loading: Story = {
  args: {
    conflicts: [],
    loading: true,
  },
};

export const Error: Story = {
  args: {
    conflicts: [],
    error: 'Failed to load conflicts',
  },
};

export const Empty: Story = {
  args: {
    conflicts: [],
  },
};


