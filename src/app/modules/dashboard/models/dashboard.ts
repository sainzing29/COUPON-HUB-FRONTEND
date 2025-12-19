export interface ActiveCouponCountByMonth {
  month: string;
  monthFull: string;
  year: number;
  activatedCouponsCount: number;
}

export interface ServiceRedemptionsByMonth {
  month: string;
  monthFull: string;
  year: number;
  servicesRedeemedCount: number;
}

export interface CouponStatusCounts {
  unassigned: number;
  active: number;
  completed: number;
  expired: number;
}

export interface DashboardStats {
  totalCouponsGenerated: number;
  totalCouponsActivated: number;
  newActivationsThisMonth: number;
  newActivationsLastMonth: number;
  activeCoupons: number;
  completedCoupons: number;
  expiredCoupons: number;
  servicesCompleted: number;
  servicesCompletedThisMonth: number;
  servicesCompletedLastMonth: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCouponCountByMonth: ActiveCouponCountByMonth[];
  serviceRedemptionsByMonth: ServiceRedemptionsByMonth[];
  couponStatusCounts: CouponStatusCounts;
}

export interface SalesTrendData {
  month: string;
  year: number;
  revenue: number;
  couponsSold: number;
}

export interface ServiceCenterData {
  serviceCenterId: number;
  serviceCenterName: string;
  servicesCompleted: number;
  couponsRedeemed: number;
  revenue: number;
}

export interface CouponUsageData {
  period: string;
  year: number;
  totalCoupons: number;
  redeemedCoupons: number;
  redemptionRate: number;
  activeCoupons: number;
  expiredCoupons: number;
  unassignedCoupons: number;
  completedCoupons: number;
}

export interface SalesTrends {
  title: string;
  description: string;
  footer: string;
  data: SalesTrendData[];
}

export interface ServiceCenterDistribution {
  title: string;
  description: string;
  footer: string;
  data: ServiceCenterData[];
}

export interface CouponUsage {
  title: string;
  description: string;
  footer: string;
  data: CouponUsageData[];
}

export interface DashboardChartData {
  salesTrends: SalesTrends;
  serviceCenterDistribution: ServiceCenterDistribution;
  couponUsage: CouponUsage;
}