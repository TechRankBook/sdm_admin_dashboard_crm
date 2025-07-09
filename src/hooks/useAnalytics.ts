import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  AnalyticsData, 
  DateRange, 
  RevenueAnalytics, 
  BookingAnalytics, 
  DriverPerformanceAnalytics,
  CustomerAnalytics,
  ServicePerformanceAnalytics
} from '@/types/analytics';

export const useAnalytics = (dateRange: DateRange) => {
  const [data, setData] = useState<AnalyticsData>({
    revenue: null,
    bookings: null,
    drivers: null,
    customers: null,
    service: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      // Fetch all analytics data in parallel
      const [
        revenueResult,
        bookingResult,
        driverResult,
        customerResult,
        serviceResult
      ] = await Promise.all([
        supabase.rpc('get_revenue_analytics', {
          start_date: startDate,
          end_date: endDate
        }),
        supabase.rpc('get_booking_analytics', {
          start_date: startDate,
          end_date: endDate
        }),
        supabase.rpc('get_driver_performance_analytics', {
          start_date: startDate,
          end_date: endDate
        }),
        supabase.rpc('get_customer_analytics', {
          start_date: startDate,
          end_date: endDate
        }),
        supabase.rpc('get_service_performance_analytics', {
          start_date: startDate,
          end_date: endDate
        })
      ]);

      // Check for errors
      if (revenueResult.error) throw revenueResult.error;
      if (bookingResult.error) throw bookingResult.error;
      if (driverResult.error) throw driverResult.error;
      if (customerResult.error) throw customerResult.error;
      if (serviceResult.error) throw serviceResult.error;

      // Process and set data
      setData({
        revenue: revenueResult.data?.[0] as RevenueAnalytics || null,
        bookings: bookingResult.data?.[0] as BookingAnalytics || null,
        drivers: driverResult.data?.[0] as DriverPerformanceAnalytics || null,
        customers: customerResult.data?.[0] as CustomerAnalytics || null,
        service: serviceResult.data?.[0] as ServicePerformanceAnalytics || null,
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange.start, dateRange.end]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

export default useAnalytics;