import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/common/Button';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('curriculum');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <Navbar onRegisterClick={() => (window.location.href = '/#pricing')} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Student Support & Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            We're Here to Help You Accelerate
          </h1>
          <p className="text-sm text-slate-500">
            Have questions about cohort schedules, enterprise team discounts, or the hands-on curriculum? Reach out to our student admissions team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-[#0F172A]">Admissions & Help Desk</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Direct Admissions Email</span>
                    <a href="mailto:support@ailaunchpad.edu" className="text-blue-600 hover:underline font-medium">
                      admissions@ailaunchpad.edu
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Student Helpline</span>
                    <span className="text-slate-600 font-mono">+91 98765 43210 (Mon–Sat)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Live Chat & Response Hours</span>
                    <span className="text-slate-600">9:00 AM – 8:00 PM IST (Under 2 hrs response)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Campus Center</span>
                    <span className="text-slate-600">HSR Layout, Sector 4, Bengaluru, Karnataka 560102</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>100% money-back guarantee honored before Day 1 start.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Send Us a Direct Message</span>
            </h2>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-sm text-emerald-900">Message Received!</h3>
                <p className="text-emerald-700">
                  Thank you, <span className="font-bold">{name}</span>. An admissions counselor will respond to{' '}
                  <span className="font-bold">{email}</span> within 2 hours.
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aditi Rao"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aditi@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Inquiry Topic</label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value="curriculum">Curriculum & Prerequisites</option>
                      <option value="batch_dates">Batch Dates & Rescheduling</option>
                      <option value="corporate">Corporate / Team Registration</option>
                      <option value="payment">Payment & Invoice Query</option>
                      <option value="other">General Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">How can we help? *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what questions you have about the bootcamp..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full"
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
