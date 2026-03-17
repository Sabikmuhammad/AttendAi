'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: '49',
    period: 'month',
    description: 'Perfect for small schools and training centers',
    features: [
      'Up to 5 cameras',
      '500 students/employees',
      'Basic analytics',
      'Email support',
      'Monthly reports',
      'Mobile app access',
    ],
    highlighted: false,
    gradient: 'from-gray-500 to-gray-600',
  },
  {
    name: 'Professional',
    price: '149',
    period: 'month',
    description: 'Most popular for growing institutions',
    features: [
      'Up to 25 cameras',
      '5,000 students/employees',
      'Advanced analytics',
      'Priority support 24/7',
      'Real-time reports',
      'API access',
      'Custom integrations',
      'Multi-location support',
    ],
    highlighted: true,
    gradient: 'from-purple-500 to-cyan-500',
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For large universities and corporations',
    features: [
      'Unlimited cameras',
      'Unlimited users',
      'Custom AI models',
      'Dedicated account manager',
      'On-premise deployment',
      'SLA guarantee 99.9%',
      'Advanced security',
      'Custom development',
    ],
    highlighted: false,
    gradient: 'from-cyan-500 to-blue-500',
  },
];

export function PricingSection() {
  return (
    <SectionWrapper id="pricing" className="bg-black/30">
      <div className="text-center mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 px-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4">
            Choose the perfect plan for your institution
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative ${plan.highlighted ? 'lg:-mt-4 lg:mb-4' : ''}`}
          >
            {/* Popular Badge */}
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-semibold shadow-lg">
                  <Sparkles className="h-4 w-4" />
                  <span>{plan.badge}</span>
                </div>
              </div>
            )}

            <div
              className={`relative backdrop-blur-xl border rounded-2xl p-6 sm:p-8 shadow-2xl transition-all group h-full flex flex-col ${
                plan.highlighted
                  ? 'bg-white/10 border-purple-500/50 lg:scale-105'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              {/* Plan Name */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-baseline">
                  {plan.price === 'Custom' ? (
                    <span className="text-3xl sm:text-4xl font-bold text-white">{plan.price}</span>
                  ) : (
                    <>
                      <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        ${plan.price}
                      </span>
                      <span className="text-gray-400 ml-2 text-sm sm:text-base">/{plan.period}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${
                      plan.highlighted ? 'text-cyan-400' : 'text-green-400'
                    }`} />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link href="/pricing" className="mt-auto">
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-purple-500/50'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                  size="lg"
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </Link>

              {/* Hover border effect */}
              {plan.highlighted && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 opacity-20 pointer-events-none" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mt-12"
      >
        <p className="text-gray-400 mb-4">All plans include 14-day free trial • No credit card required</p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <span>✓ Free setup & onboarding</span>
          <span>✓ Cancel anytime</span>
          <span>✓ 99.9% uptime SLA</span>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
