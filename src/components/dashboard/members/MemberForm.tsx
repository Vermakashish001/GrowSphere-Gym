"use client";

import { useState } from "react";
import { MembershipPlan } from "@prisma/client";
import { addMember } from "@/lib/actions";
import { User, Mail, Phone, CreditCard, UserCircle } from "lucide-react";
import Link from "next/link";

interface MemberFormProps {
  plans: Array<{ id: string; name: string; price: string }>;
}

export default function MemberForm({ plans }: MemberFormProps) {
  const [selectedPlan, setSelectedPlan] = useState("");

  return (
    <form action={addMember} className="space-y-4 sm:space-y-6">
      {/* Personal Information Section */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <UserCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Personal Information</h2>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  placeholder="John"
                  className="w-full bg-background border border-border rounded-lg pl-11 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  placeholder="Doe"
                  className="w-full bg-background border border-border rounded-lg pl-11 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="john.doe@example.com"
                  className="w-full bg-background border border-border rounded-lg pl-11 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-background border border-border rounded-lg pl-11 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Membership Plan Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Membership Plan</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="planId" className="block text-sm font-medium text-foreground mb-2">
              Select Plan <span className="text-red-500">*</span>
            </label>
            <select
              name="planId"
              id="planId"
              required
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">Choose a membership plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ₹{plan.price.toString()}/month
                </option>
              ))}
            </select>
          </div>

          {plans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {plans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary ${
                    selectedPlan === plan.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                >
                  <h3 className="font-semibold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-2xl font-bold text-primary">₹{plan.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">per month</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Link
          href="/dashboard/members"
          className="px-6 py-2.5 rounded-lg font-medium text-foreground bg-secondary/50 hover:bg-secondary transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-8 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          Add Member
        </button>
      </div>
    </form>
  );
}