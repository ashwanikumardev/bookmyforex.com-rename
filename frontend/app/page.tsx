'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Shield, Clock, Award } from 'lucide-react';
import { rateAPI } from '@/lib/api';
import { subscribeToRates } from '@/lib/websocket';
import { formatCurrency } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial rates
    const fetchRates = async () => {
      try {
        const response = await rateAPI.getAllRates();
        setRates(response.data.data.rates);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rates:', error);
        setLoading(false);
      }
    };

    fetchRates();

    // Subscribe to real-time rate updates
    const unsubscribe = subscribeToRates((data: any) => {
      setRates(data.rates);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8 text-primary-600" />,
      title: 'Best Exchange Rates',
      description: 'Get the most competitive forex rates in the market with real-time updates',
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: 'Secure & Safe',
      description: 'RBI authorized with bank-grade security for all transactions',
    },
    {
      icon: <Clock className="w-8 h-8 text-primary-600" />,
      title: 'Doorstep Delivery',
      description: 'Get forex delivered to your doorstep within 24 hours',
    },
    {
      icon: <Award className="w-8 h-8 text-primary-600" />,
      title: 'Lowest Rate Guarantee',
      description: 'We guarantee the lowest rates or 2x the difference back',
    },
  ];

  const services = [
    {
      title: 'Buy Foreign Currency',
      description: 'Order foreign currency cash for your travel',
      link: '/buy-currency',
      image: '💵',
    },
    {
      title: 'Forex Card',
      description: 'Multi-currency prepaid travel cards',
      link: '/forex-card',
      image: '💳',
    },
    {
      title: 'Send Money Abroad',
      description: 'International money transfer at best rates',
      link: '/send-money',
      image: '🌍',
    },
    {
      title: 'Sell Foreign Currency',
      description: 'Sell your unused foreign currency',
      link: '/sell-currency',
      image: '💰',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Best Foreign Exchange Rates in India
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Buy currency, forex cards, send money abroad at unbeatable rates with doorstep delivery
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/buy-currency" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started
              </Link>
              <Link href="/rates" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                View Rates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Rates Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Live Exchange Rates</h2>
            <p className="text-gray-600">Real-time forex rates updated every 30 seconds</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {rates.slice(0, 10).map((rate) => (
                <div key={rate.currencyCode} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{rate.currencyCode}</span>
                    <span className="text-sm text-gray-500">{rate.currencyName}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">We Buy:</span>
                      <span className="font-semibold text-green-600">
                        ₹{rate.buyRate.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">We Sell:</span>
                      <span className="font-semibold text-blue-600">
                        ₹{rate.sellRate.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/buy-currency?currency=${rate.currencyCode}`}
                    className="mt-4 block text-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Book Now →
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/rates" className="btn-outline inline-flex items-center gap-2">
              View All Rates <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-600">Complete forex solutions for all your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link key={index} href={service.link} className="card hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-5xl mb-4">{service.image}</div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <span className="text-primary-600 font-medium inline-flex items-center gap-1">
                  Learn More <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose BookMyForex?</h2>
            <p className="text-gray-600">India's most trusted forex marketplace</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of satisfied customers who trust BookMyForex
          </p>
          <Link href="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
            Create Free Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
