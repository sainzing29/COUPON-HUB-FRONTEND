import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, stagger, query } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerCards', [
      transition(':enter', [
        query('.stat-card', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ]),
    trigger('slideInFromRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  stats = [
    {
      title: 'Used Space',
      value: '49/50 GB',
      icon: 'folder',
      iconColor: 'bg-orange-500',
      status: 'warning',
      statusText: 'Get More Space...',
      statusIcon: 'warning'
    },
    {
      title: 'Revenue',
      value: '$34,245',
      icon: 'trending_up',
      iconColor: 'bg-green-500',
      status: 'info',
      statusText: 'Last 24 Hours',
      statusIcon: 'schedule'
    },
    {
      title: 'Fixed Issues',
      value: '75',
      icon: 'info',
      iconColor: 'bg-red-500',
      status: 'info',
      statusText: 'Tracked from Github',
      statusIcon: 'code'
    },
    {
      title: 'Followers',
      value: '+245',
      icon: 'people',
      iconColor: 'bg-cyan-500',
      status: 'success',
      statusText: 'Just Updated',
      statusIcon: 'refresh'
    }
  ];

  charts = [
    {
      title: 'Daily Sales',
      description: '↑ 55% increase in today sales.',
      descriptionColor: 'text-green-600',
      timeText: 'updated 4 minutes ago',
      chartData: this.generateLineChartData(),
      chartType: 'line'
    },
    {
      title: 'Email Subscriptions',
      description: 'Last Campaign Performance',
      descriptionColor: 'text-gray-600',
      timeText: 'campaign sent 2 days ago',
      chartData: this.generateBarChartData(),
      chartType: 'bar'
    },
    {
      title: 'Completed Tasks',
      description: 'Last Campaign Performance',
      descriptionColor: 'text-gray-600',
      timeText: 'campaign sent 2 days ago',
      chartData: this.generateTaskChartData(),
      chartType: 'line'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  generateLineChartData(): number[] {
    return [12, 19, 3, 5, 2, 3, 20, 25, 18, 22, 28, 35];
  }

  generateBarChartData(): number[] {
    return [200, 300, 400, 500, 600, 700, 800, 750, 650, 550, 450, 350];
  }

  generateTaskChartData(): number[] {
    return [800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250];
  }

  getMaxValue(data: number[]): number {
    return Math.max(...data);
  }
}