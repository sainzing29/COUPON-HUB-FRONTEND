export interface DashboardStats {
  totalCouponsSold: number;
  couponsSoldLastMonth: number;
  couponsSoldThisMonth: number;
  activeCoupons: number;
  servicesCompleted: number;
  servicesCompletedThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
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