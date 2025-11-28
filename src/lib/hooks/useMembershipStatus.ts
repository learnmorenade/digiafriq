'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth';
import { usePathname } from 'next/navigation';

interface MembershipStatus {
  hasLearnerMembership: boolean;
  hasAffiliateMembership: boolean;
  activeMemberships: Array<{
    id: string;
    membershipName: string;
    membershipType: 'learner' | 'affiliate';
    expiresAt: string;
    isActive: boolean;
  }>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMembershipStatus(): MembershipStatus {
  const { user } = useAuth();
  const pathname = usePathname();
  const [status, setStatus] = useState<MembershipStatus>({
    hasLearnerMembership: false,
    hasAffiliateMembership: false,
    activeMemberships: [],
    loading: true,
    error: null,
    refresh: async () => {},
  });

  // Memoized fetch function that can be called manually
  const fetchMembershipStatus = useCallback(async () => {
    if (!user) {
      setStatus(prev => ({
        ...prev,
        hasLearnerMembership: false,
        hasAffiliateMembership: false,
        activeMemberships: [],
        loading: false,
        error: 'User not authenticated',
      }));
      return;
    }

    try {
      // Get user profile for role check
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // Get active memberships
      const { data: memberships, error } = await supabase
        .from('user_memberships')
        .select(`
          id,
          is_active,
          expires_at,
          membership_packages (
            id,
            name,
            member_type
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        console.error('Error fetching membership status:', error);
        setStatus(prev => ({
          ...prev,
          hasLearnerMembership: false,
          hasAffiliateMembership: false,
          activeMemberships: [],
          loading: false,
          error: error.message,
        }));
        return;
      }

      const activeMemberships = (memberships || []).map(m => ({
        id: m.id,
        membershipName: m.membership_packages?.name || 'Unknown',
        membershipType: m.membership_packages?.member_type || 'learner',
        expiresAt: m.expires_at,
        isActive: m.is_active
      }));

      const hasLearnerMembership = activeMemberships.some(m => m.membershipType === 'learner');
      const hasAffiliateMembership = activeMemberships.some(m => m.membershipType === 'affiliate') || 
                                   profile?.role === 'affiliate';

      setStatus(prev => ({
        ...prev,
        hasLearnerMembership,
        hasAffiliateMembership,
        activeMemberships,
        loading: false,
        error: null,
      }));

    } catch (err) {
      console.error('Unexpected error fetching membership status:', err);
      setStatus(prev => ({
        ...prev,
        hasLearnerMembership: false,
        hasAffiliateMembership: false,
        activeMemberships: [],
        loading: false,
        error: 'Failed to fetch membership status',
      }));
    }
  }, [user]);

  // Initial fetch on mount or when user changes
  useEffect(() => {
    fetchMembershipStatus();
  }, [fetchMembershipStatus]);

  // Refetch when route changes
  useEffect(() => {
    fetchMembershipStatus();
  }, [pathname, fetchMembershipStatus]);

  // Refetch when tab becomes visible or gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('🔍 Visibility change detected:', document.visibilityState);
      if (document.visibilityState === 'visible') {
        console.log('📱 Tab became visible, refreshing membership status...');
        fetchMembershipStatus();
      }
    };

    const handleFocus = () => {
      console.log('👀 Tab gained focus, refreshing membership status...');
      fetchMembershipStatus();
    };

    const handleBlur = () => {
      console.log('👋 Tab lost focus, will refresh membership status when regained...');
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [fetchMembershipStatus]);

  return {
    ...status,
    refresh: fetchMembershipStatus,
  };
}
