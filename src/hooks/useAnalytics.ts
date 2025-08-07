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

      // Fetch all analytics data with individual error handling
      const results = await Promise.allSettled([
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

      const [revenueResult, bookingResult, driverResult, customerResult, serviceResult] = results;

      // Default values for failed calls
      const defaultData = {
        revenue: null,
        bookings: null,
        drivers: null,
        customers: null,
        service: null,
      };

      // Extract data with fallbacks
      const extractData = (result: PromiseSettledResult<any>, fallback: any = null) => {
        if (result.status === 'fulfilled' && result.value && !result.value.error) {
          return result.value.data?.[0] || fallback;
        }
        return fallback;
      };

      // Collect errors for reporting
      const errors: string[] = [];
      results.forEach((result, index) => {
        const names = ['revenue', 'booking', 'driver', 'customer', 'service'];
        if (result.status === 'rejected') {
          errors.push(`${names[index]} analytics failed: ${result.reason?.message || 'Unknown error'}`);
        } else if (result.value?.error) {
          errors.push(`${names[index]} analytics error: ${result.value.error.message}`);
        }
      });

      if (errors.length > 0) {
        console.warn('Analytics errors:', errors);
        setError(`Some analytics data unavailable: ${errors.length} of 5 sources failed`);
      }

      // Set data with fallbacks
      setData({
        revenue: extractData(revenueResult),
        bookings: extractData(bookingResult),
        drivers: extractData(driverResult),
        customers: extractData(customerResult),
        service: extractData(serviceResult),
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(`Failed to fetch analytics: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Set null data on complete failure
      setData({
        revenue: null,
        bookings: null,
        drivers: null,
        customers: null,
        service: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Set up real-time subscriptions for analytics data
    const bookingsChannel = supabase
      .channel('analytics-bookings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchAnalytics()
      )
      .subscribe()

    const driversChannel = supabase
      .channel('analytics-drivers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'drivers' },
        () => fetchAnalytics()
      )
      .subscribe()

    const customersChannel = supabase
      .channel('analytics-customers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        () => fetchAnalytics()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(bookingsChannel)
      supabase.removeChannel(driversChannel)
      supabase.removeChannel(customersChannel)
    }
  }, [dateRange.start, dateRange.end]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

export default useAnalytics;