'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Zap, Users, Crown, Calendar, DollarSign, ExternalLink, RefreshCw, Info } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth';
import { useMembershipStatus } from '@/lib/hooks/useMembershipStatus';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface MembershipPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_months: number;
  member_type: 'learner' | 'affiliate';
  is_active: boolean;
  features: string[];
  created_at: string;
}

interface UserMembership {
  id: string;
  membership_package_id: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  membership_packages: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    duration_months: number;
    member_type: 'learner' | 'affiliate';
    features: string[];
  };
}

export default function LearnerMembershipPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { hasLearnerMembership, hasAffiliateMembership, hasLifetimeAffiliateAccess, activeMemberships, loading: membershipLoading, refresh } = useMembershipStatus();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<MembershipPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const [selectedMembership, setSelectedMembership] = useState<UserMembership | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchMemberships();
    fetchUserMemberships();
  }, []);

  const fetchUserMemberships = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_memberships')
        .select(`
          id,
          membership_package_id,
          started_at,
          expires_at,
          is_active,
          membership_packages (
            id,
            name,
            description,
            price,
            currency,
            duration_months,
            member_type,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false }) as any;

      if (error) throw error;
      setUserMemberships(data || []);
    } catch (error) {
      console.error('Error fetching user memberships:', error);
    }
  };

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('membership_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;

      setMemberships(data || []);
    } catch (error) {
      console.error('Error fetching memberships:', error);
      toast.error('Failed to load membership packages');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (membership: MembershipPackage) => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    // Check if user already has this membership type
    const existingMembership = userMemberships.find(
      um => um.membership_packages.member_type === membership.member_type
    );

    if (existingMembership) {
      toast.error(`You already have an active ${membership.member_type} membership`);
      return;
    }

    // Navigate to checkout page with only membership ID
    // Checkout page will fetch all data from database
    router.push(`/dashboard/learner/membership/checkout?membershipId=${membership.id}`);
  };

  const handleManageMembership = (membership: UserMembership) => {
    setSelectedMembership(membership);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedMembership(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getMembershipIcon = (membership: MembershipPackage, index: number) => {
    if (membership.member_type === 'affiliate') {
      return Crown;
    }
    const icons = [Sparkles, Zap, Users];
    const Icon = icons[index % icons.length];
    return Icon;
  };

  const getMembershipBadge = (membership: MembershipPackage, index: number) => {
    if (membership.member_type === 'affiliate') {
      return { text: 'Affiliate', color: 'bg-purple-50 text-purple-600' };
    }
    
    const badges = [
      { text: 'Popular', color: 'bg-orange-50 text-[#ed874a]' },
      { text: 'Best Value', color: 'bg-green-50 text-green-600' },
      { text: 'Premium', color: 'bg-blue-50 text-blue-600' },
    ];
    return badges[index % badges.length];
  };

  // Render active memberships section
  const renderActiveMemberships = () => {
    if (userMemberships.length === 0) return null;

    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Active Memberships</h2>
        
        <div className="space-y-6">
          {userMemberships.map((membership) => {
            const daysUntilExpiry = getDaysUntilExpiry(membership.expires_at);
            const isExpiringSoon = daysUntilExpiry <= 30;
            const isLearner = membership.membership_packages.member_type === 'learner';
            
            return (
              <div
                key={membership.id}
                className={`rounded-2xl border-2 p-6 transition-all ${
                  isLearner 
                    ? 'bg-gradient-to-r from-[#ed874a]/10 to-[#d76f32]/10 border-[#ed874a]/20' 
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {isLearner ? (
                        <div className="w-10 h-10 bg-[#ed874a]/20 rounded-full flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-[#ed874a]" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Crown className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {membership.membership_packages.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isLearner 
                              ? 'bg-[#ed874a]/20 text-[#ed874a]' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {isLearner ? 'Learner' : 'Affiliate'}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Active
                          </span>
                          {isLearner && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isExpiringSoon 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {daysUntilExpiry > 0 
                                ? `${daysUntilExpiry} days remaining` 
                                : 'Expired'
                              }
                            </span>
                          )}
                          {!isLearner && hasLifetimeAffiliateAccess && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200">
                              LIFETIME ACCESS
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Started: {formatDate(membership.started_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {!isLearner && hasLifetimeAffiliateAccess 
                            ? 'Never Expires' 
                            : `Expires: ${formatDate(membership.expires_at)}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">
                          {formatPrice(membership.membership_packages.price, membership.membership_packages.currency)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {membership.membership_packages.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isLearner 
                                ? 'bg-[#ed874a]/10 text-[#ed874a]' 
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {feature}
                          </span>
                        ))}
                        {membership.membership_packages.features.length > 3 && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            +{membership.membership_packages.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {isLearner ? (
                      <>
                        <button
                          onClick={() => handleManageMembership(membership)}
                          className="px-4 py-2 bg-[#ed874a] text-white rounded-lg hover:bg-[#d76f32] transition-colors font-medium text-sm"
                        >
                          <Info className="w-4 h-4 inline mr-2" />
                          View Details
                        </button>
                        {/* Only show upgrade button if user doesn't have affiliate membership */}
                        {!hasAffiliateMembership && (
                          <button
                            onClick={() => {
                              const affiliateMemberships = memberships.filter(m => m.member_type === 'affiliate');
                              if (affiliateMemberships.length > 0) {
                                router.push(`/dashboard/learner/membership/checkout?membershipId=${affiliateMemberships[0].id}&upgrade=true`);
                              } else {
                                toast.error('Affiliate membership package not found');
                              }
                            }}
                            className="px-4 py-2 border border-[#ed874a] text-[#ed874a] rounded-lg hover:bg-[#ed874a]/10 transition-colors font-medium text-sm"
                          >
                            <RefreshCw className="w-4 h-4 inline mr-2" />
                            Upgrade to Affiliate
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => handleManageMembership(membership)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                      >
                        <ExternalLink className="w-4 h-4 inline mr-2" />
                        Manage Affiliate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render available plans section
  const renderAvailablePlans = () => {
    const availableMemberships = memberships.filter(membership => 
      !userMemberships.some(um => um.membership_packages.member_type === membership.member_type)
    );

    if (availableMemberships.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#ed874a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-[#ed874a]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            You're all set!
          </h3>
          <p className="text-gray-600">
            You have active memberships for all available categories.
          </p>
        </div>
      );
    }

    // Get learner membership price for upgrade calculations
    const learnerMembership = memberships.find(m => m.member_type === 'learner');
    const learnerPrice = learnerMembership?.price || 10; // Fallback to $10

    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {hasLearnerMembership ? 'Additional Memberships' : 'Choose Your Membership'}
        </h2>
        
        <div className={`grid gap-6 max-w-5xl mx-auto ${
          availableMemberships.length === 1 ? 'grid-cols-1 max-w-md' :
          availableMemberships.length === 2 ? 'md:grid-cols-2' :
          'md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {availableMemberships.map((membership, index) => {
            const Icon = getMembershipIcon(membership, index);
            const badge = getMembershipBadge(membership, index);
            const isHighlighted = index === 1 && availableMemberships.length > 1;
            
            // Smart pricing logic for affiliate upgrades
            const isAffiliateUpgrade = hasLearnerMembership && membership.member_type === 'affiliate';
            const displayPrice = isAffiliateUpgrade ? membership.price - learnerPrice : membership.price;
            const isUpgrade = isAffiliateUpgrade && displayPrice < membership.price;
            const isLifetime = membership.member_type === 'affiliate';

            return (
              <div
                key={membership.id}
                className={`rounded-2xl border-2 p-8 transition-all hover:shadow-lg ${
                  isHighlighted
                    ? 'bg-gradient-to-br from-[#ed874a] to-orange-500 border-[#ed874a] text-white hover:shadow-2xl relative overflow-hidden'
                    : 'bg-white border-gray-200 hover:border-[#ed874a]'
                }`}
              >
                {/* Background decoration for highlighted card */}
                {isHighlighted && (
                  <>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
                  </>
                )}

                <div className={isHighlighted ? 'relative z-10' : ''}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${isHighlighted ? 'text-white' : 'text-gray-900'}`}>
                      {isUpgrade ? 'Upgrade to Affiliate' : membership.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        isHighlighted 
                          ? 'bg-white/20 backdrop-blur-sm text-white' 
                          : badge.color
                      }`}>
                        <Icon className="w-4 h-4" />
                        {isUpgrade ? 'Upgrade' : badge.text}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm ${isHighlighted ? 'text-white/90' : 'text-gray-500'}`}>
                        {membership.currency === 'GHS' ? '₵' : membership.currency === 'NGN' ? '₦' : '$'}
                      </span>
                      <span className={`text-5xl font-bold ${isHighlighted ? 'text-white' : 'text-gray-900'}`}>
                        {membership.currency === 'GHS' || membership.currency === 'NGN' ? displayPrice.toLocaleString() : displayPrice}
                      </span>
                      {isUpgrade && (
                        <div className={`flex items-center gap-1 ${isHighlighted ? 'text-white/90' : 'text-gray-500'}`}>
                          <span className="text-sm line-through">
                            {membership.currency === 'GHS' ? '₵' : membership.currency === 'NGN' ? '₦' : '$'}
                            {membership.currency === 'GHS' || membership.currency === 'NGN' ? membership.price.toLocaleString() : membership.price}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isHighlighted ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                          }`}>
                            Save ${membership.currency === 'GHS' || membership.currency === 'NGN' ? (membership.price - displayPrice).toLocaleString() : membership.price - displayPrice}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className={`text-sm mt-2 ${isHighlighted ? 'text-white/80' : 'text-gray-500'}`}>
                      {isUpgrade 
                        ? `Add affiliate access to your learner membership`
                        : (isLifetime 
                          ? 'Get both learner and affiliate access in one package'
                          : `${formatPrice(displayPrice / membership.duration_months, membership.currency)} per month`
                        )
                      }
                    </p>
                  </div>

                  {/* Description */}
                  <p className={`mb-6 ${isHighlighted ? 'text-white/95' : 'text-gray-600'}`}>
                    {isUpgrade 
                      ? 'Unlock lifetime affiliate features: earn commissions by promoting courses, access affiliate dashboard, and track your earnings.'
                      : (isLifetime 
                        ? 'Get lifetime access to affiliate features including commission tracking and promotional materials.'
                        : (membership.description || 'Full access to our learning platform')
                      )
                    }
                  </p>

                  {/* Pricing Clarification for Affiliate Memberships */}
                  {isLifetime && !isUpgrade && (
                    <div className={`mb-6 p-4 rounded-lg ${
                      isHighlighted 
                        ? 'bg-white/10 border border-white/20' 
                        : 'bg-purple-50 border border-purple-200'
                    }`}>
                      <h4 className={`font-semibold mb-2 ${isHighlighted ? 'text-white' : 'text-purple-900'}`}>
                        💰 Pricing Breakdown
                      </h4>
                      <div className={`space-y-1 text-sm ${isHighlighted ? 'text-white/90' : 'text-purple-700'}`}>
                        <div className="flex justify-between">
                          <span>Learner Membership:</span>
                          <span>$10/year</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Affiliate Lifetime Access:</span>
                          <span>$7 one-time</span>
                        </div>
                        <div className={`pt-2 mt-2 border-t ${
                          isHighlighted ? 'border-white/20' : 'border-purple-300'
                        }`}>
                          <div className="flex justify-between font-semibold">
                            <span>Total Bundle Price:</span>
                            <span>${displayPrice}</span>
                          </div>
                        </div>
                      </div>
                      <p className={`text-xs mt-3 ${isHighlighted ? 'text-white/80' : 'text-purple-600'}`}>
                        💡 Tip: If you already have learner membership, you can upgrade to affiliate for just $7!
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {(isUpgrade ? [
                      'Earn commissions on course sales',
                      'Access affiliate dashboard',
                      'Track earnings and analytics',
                      'Promotional materials provided',
                      'Dedicated affiliate support',
                      'Lifetime access - no renewal fees'
                    ] : (isLifetime ? [
                      'Earn commissions on course sales',
                      'Access affiliate dashboard',
                      'Track earnings and analytics',
                      'Promotional materials provided',
                      'Dedicated affiliate support',
                      'Lifetime access - no renewal fees'
                    ] : membership.features)).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          isHighlighted 
                            ? 'bg-white/20 backdrop-blur-sm' 
                            : 'bg-[#ed874a]/10'
                        }`}>
                          <Check className={`w-3 h-3 ${isHighlighted ? 'text-white' : 'text-[#ed874a]'}`} />
                        </div>
                        <span className={isHighlighted ? 'text-white' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <button
                    onClick={() => handleSelectPlan(membership)}
                    disabled={loadingPlan !== null}
                    className={`w-full py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isHighlighted
                        ? 'bg-white text-[#ed874a] hover:bg-gray-50 shadow-lg'
                        : 'bg-white border-2 border-[#ed874a] text-[#ed874a] hover:bg-orange-50'
                    }`}
                  >
                    {loadingPlan === membership.id ? 'Processing...' : (
                      isUpgrade ? `Get Affiliate for ${membership.currency === 'GHS' ? '₵' : membership.currency === 'NGN' ? '₦' : '$'}${displayPrice}` : 
                      (isLifetime ? `Get Bundle for ${membership.currency === 'GHS' ? '₵' : membership.currency === 'NGN' ? '₦' : '$'}${displayPrice}` : `Get ${membership.name}`)
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading || membershipLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Membership Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Loading your membership information...
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ed874a]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Membership Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            {hasLearnerMembership && hasAffiliateMembership 
              ? "Manage your active memberships and explore additional options"
              : hasLearnerMembership
              ? "Manage your learner membership and explore affiliate opportunities"
              : "Choose the perfect plan for your learning and earning journey"
            }
          </p>
        </div>

        {/* Active Memberships Section */}
        {renderActiveMemberships()}

        {/* Available Plans Section */}
        {renderAvailablePlans()}

        {/* Support Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@digiafriq.com" className="text-[#ed874a] hover:underline font-medium">
              support@digiafriq.com
            </a>
          </p>
        </div>

        {/* Membership Details Modal */}
        {showDetailsModal && selectedMembership && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedMembership.membership_packages.name}
                  </h2>
                  <button
                    onClick={handleCloseDetailsModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Membership Type Badge */}
                <div className="mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedMembership.membership_packages.member_type === 'learner' 
                      ? 'bg-[#ed874a]/20 text-[#ed874a]' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {selectedMembership.membership_packages.member_type === 'learner' ? 'Learner' : 'Affiliate'} Membership
                  </span>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">
                    {selectedMembership.membership_packages.description || 'No description available'}
                  </p>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {selectedMembership.membership_packages.currency === 'GHS' ? '₵' : 
                       selectedMembership.membership_packages.currency === 'NGN' ? '₦' : '$'}
                      {selectedMembership.membership_packages.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      {selectedMembership.membership_packages.duration_months === 12 
                        ? 'per year' 
                        : `for ${selectedMembership.membership_packages.duration_months} month${selectedMembership.membership_packages.duration_months !== 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                  <ul className="space-y-2">
                    {selectedMembership.membership_packages.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Membership Period */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Membership Period</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span className="text-gray-900 font-medium">{formatDate(selectedMembership.started_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {selectedMembership.membership_packages.member_type === 'affiliate' && hasLifetimeAffiliateAccess 
                          ? 'Expires:' 
                          : 'Expires:'
                        }
                      </span>
                      <span className="text-gray-900 font-medium">
                        {selectedMembership.membership_packages.member_type === 'affiliate' && hasLifetimeAffiliateAccess 
                          ? 'Never (Lifetime Access)' 
                          : formatDate(selectedMembership.expires_at)
                        }
                      </span>
                    </div>
                    {selectedMembership.membership_packages.member_type === 'learner' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days Remaining:</span>
                        <span className={`font-medium ${
                          getDaysUntilExpiry(selectedMembership.expires_at) <= 30 
                            ? 'text-orange-600' 
                            : 'text-green-600'
                        }`}>
                          {getDaysUntilExpiry(selectedMembership.expires_at)} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
