import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';

import { GfToggleComponent } from './toggle.component';

export default {
  title: 'Toggle',
  component: GfToggleComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatRadioModule, ReactiveFormsModule]
    })
  ]
} as Meta<GfToggleComponent>;

type Story = StoryObj<GfToggleComponent>;

export const Default: Story = {
  args: {
    defaultValue: '1d',
    isLoading: false,
    options: [
      { label: '1D', value: '1d' },
      { label: '5D', value: '5d' },
      { label: '1M', value: '1m' },
      { label: '6M', value: '6m' },
      { label: 'YTD', value: 'ytd' },
      { label: '1Y', value: '1y' },
      { label: '4Y', value: '4y' },
      { label: '5Y', value: '5y' },
      { label: 'MAX', value: 'max' }
    ]
  }
};
