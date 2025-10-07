"use client";

import { MembershipPlan } from "@prisma/client";
import { addMember } from "@/lib/actions";

interface MemberFormProps {
  plans: Array<{ id: string; name: string; price: string }>;
}

export default function MemberForm({ plans }: MemberFormProps) {
  return (
    // The main form container with styles
    <form action={addMember} className="space-y-6 bg-card p-8 rounded-xl border border-border">
      
      {/* Grid for First Name and Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-muted-foreground mb-2">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            required
            className="w-full bg-input rounded-lg border border-border px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-muted-foreground mb-2">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            required
            className="w-full bg-input rounded-lg border border-border px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {/* Email Address */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          className="w-full bg-input rounded-lg border border-border px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {/* Membership Plan Select Dropdown */}
      <div>
        <label htmlFor="planId" className="block text-sm font-medium text-muted-foreground mb-2">
          Membership Plan
        </label>
        <select
          name="planId"
          id="planId"
          required
          className="w-full bg-input rounded-lg border border-border px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none appearance-none"
        >
          <option value="">Select a plan</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - ₹{plan.price.toString()}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-6 py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Add Member
        </button>
      </div>
    </form>
  );
}