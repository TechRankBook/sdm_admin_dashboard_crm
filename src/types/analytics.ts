export interface RevenueAnalytics {
  total_revenue: number;
  completed_bookings: number;
  average_fare: number;
  revenue_growth_percentage: number;
  daily_revenue: Array<{
    date: string;
    revenue: number;
  }>;
}

export interface BookingAnalytics {
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  pending_bookings: number;
  completion_rate: number;
  booking_trends: Array<{
    date: string;
    bookings: number;
  }>;
  ride_type_distribution: Array<{
    ride_type: string;
    count: number;
  }>;
  hourly_distribution: Array<{
    hour: number;
    bookings: number;
  }>;
}

export interface DriverPerformanceAnalytics {
  total_active_drivers: number;
  average_rating: number;
  top_drivers: Array<{
    id: string;
    name: string;
    rides: number;
    earnings: number;
    rating: number;
  }>;
  driver_status_distribution: Array<{
    status: string;
    count: number;
  }>;
  driver_earnings: Array<{
    driver_name: string;
    total_earnings: number;
    rides_completed: number;
  }>;
}

export interface CustomerAnalytics {
  total_customers: number;
  new_customers: number;
  repeat_customers: number;
  customer_retention_rate: number;
  top_customers: Array<{
    id: string;
    name: string;
    total_bookings: number;
    total_spent: number;
    loyalty_points: number;
  }>;
  customer_acquisition_trend: Array<{
    date: string;
    new_customers: number;
  }>;
}

export interface ServicePerformanceAnalytics {
  average_trip_duration: number;
  average_distance: number;
  service_efficiency_score: number;
  popular_routes: Array<{
    route: string;
    frequency: number;
    avg_fare: number;
  }>;
  vehicle_utilization: Array<{
    vehicle_id: string;
    vehicle_model: string;
    total_trips: number;
    utilization_percentage: number;
  }>;
  maintenance_insights: Array<{
    total_maintenance_cost: number;
    maintenance_frequency: number;
    avg_cost_per_service: number;
  }>;
}

export interface AnalyticsData {
  revenue: RevenueAnalytics | null;
  bookings: BookingAnalytics | null;
  drivers: DriverPerformanceAnalytics | null;
  customers: CustomerAnalytics | null;
  service: ServicePerformanceAnalytics | null;
}

export interface DateRange {
  start: Date;
  end: Date;
}