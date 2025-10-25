"use client";

import { useState } from "react";
import { Payment, Member, Gym } from "@prisma/client";
import {
  CreditCard,
  MapPin,
  Mail,
  Building2,
  Globe,
  Users,
  MessageSquare,
  Calendar,
  FileText,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";

// Serialized Payment type with Decimal as string
type SerializedPayment = Omit<Payment, 'amount'> & {
  amount: string;
};

type PaymentWithMember = SerializedPayment & {
  member: Member;
};

interface BillingViewProps {
  payments: PaymentWithMember[];
  gym: Gym;
  memberCount: number;
  currentUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

type TabType = "overview" | "invoices" | "payment-methods" | "usage";
type InvoiceFilter = "all" | "paid" | "open";
type PaymentMethodFilter = "primary" | "backup";

export default function BillingView({
  payments,
  gym,
  memberCount,
  currentUser,
}: BillingViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [invoiceFilter, setInvoiceFilter] = useState<InvoiceFilter>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] =
    useState<PaymentMethodFilter>("primary");

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "invoices", label: "Invoices" },
    { id: "payment-methods", label: "Payment Methods" },
    { id: "usage", label: "Usage" },
  ];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: any) => {
    return `₹${parseFloat(amount.toString()).toFixed(2)}`;
  };

  // Mock data for demonstration
  const currentPlan = {
    name: "Pro",
    price: "₹49/mo",
    nextInvoiceDate: "Nov 28, 2025",
  };

  const paymentMethods = [
    {
      type: "Visa",
      last4: "4242",
      expires: "04/28",
      isDefault: true,
    },
    {
      type: "ACH",
      last4: "0112",
      expires: "—",
      isDefault: false,
    },
  ];

  const billingDetails = {
    email: "billing@growsphere.app",
    companyName: "GrowSphere Inc.",
    address: "123 Market St, San Francisco, CA 94103",
    taxId: "US-12-3456789",
    country: "United States",
  };

  const usageStats = {
    activeMembers: memberCount,
    locations: 2,
    smsSent: 1240,
    emailsSent: 8560,
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const filteredInvoices =
    invoiceFilter === "all"
      ? payments
      : payments.filter(
          (payment) => payment.status.toLowerCase() === invoiceFilter
        );

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        icon={CreditCard}
        title="Billing"
        description="Manage subscription, invoices, and payment methods"
        action={
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-secondary/50 hover:bg-secondary rounded-lg font-medium transition-colors">
              Update Payment
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors shadow-lg shadow-primary/20">
              Upgrade Plan
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Current Plan & Next Invoice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Current Plan */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Current Plan
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {currentPlan.name} — {currentPlan.price}
                  </p>
                </div>
                <button className="px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors">
                  Change
                </button>
              </div>
            </div>

            {/* Next Invoice */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Next Invoice
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {currentPlan.nextInvoiceDate}
                  </p>
                </div>
                <button className="px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors">
                  View
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Invoices & Billing Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Invoices */}
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Invoices
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInvoiceFilter("all")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                        invoiceFilter === "all"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setInvoiceFilter("paid")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                        invoiceFilter === "paid"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      Paid
                    </button>
                    <button
                      onClick={() => setInvoiceFilter("open")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                        invoiceFilter === "open"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      Open
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-[500px]">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                          Invoice
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                          Date
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                          Status
                        </th>
                        <th className="text-right text-xs font-medium text-muted-foreground py-3 px-4">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.slice(0, 5).map((payment, index) => (
                        <tr
                          key={payment.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="py-3 px-4 text-xs sm:text-sm text-foreground">
                            #INV-{payment.id.slice(0, 4).toUpperCase()}
                          </td>
                          <td className="py-3 px-4 text-xs sm:text-sm text-foreground">
                            {formatDate(payment.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                                payment.status.toLowerCase() === "paid"
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-yellow-500/20 text-yellow-500"
                              }`}
                            >
                              {payment.status.charAt(0).toUpperCase() +
                                payment.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs sm:text-sm text-foreground text-right font-medium">
                            {formatAmount(payment.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Billing Details */}
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
                  Billing Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Billing Email
                    </p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {billingDetails.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Company Name
                    </p>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {billingDetails.companyName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    Billing Address
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {billingDetails.address}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Tax ID (VAT)
                    </p>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {billingDetails.taxId}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Country
                    </p>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {billingDetails.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Proration
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      ₹0.00
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Estimated Next Charge
                      </p>
                    </div>
                    <p className="text-lg font-bold text-foreground">₹49.00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Methods & Usage */}
            <div className="space-y-6">
              {/* Payment Methods */}
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Payment Methods
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethodFilter("primary")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        paymentMethodFilter === "primary"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      Primary
                    </button>
                    <button
                      onClick={() => setPaymentMethodFilter("backup")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        paymentMethodFilter === "backup"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      Backup
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {method.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            •••• {method.last4}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Expires
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {method.expires}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors">
                  Add Payment Method
                </button>
              </div>

              {/* Usage Summary */}
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
                  Usage Summary
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Active Members
                    </p>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold text-foreground">
                        {usageStats.activeMembers}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Locations
                    </p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold text-foreground">
                        {usageStats.locations}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      SMS Sent (mo)
                    </p>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold text-foreground">
                        {usageStats.smsSent.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Emails Sent (mo)
                    </p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold text-foreground">
                        {usageStats.emailsSent.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Usage resets on the 28th of each month.
                </p>
              </div>

              {/* Receipts Emailing */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Receipts Emailing
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Send receipts to customers
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Enabled</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-primary">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Reply-to Address
                    </p>
                    <input
                      placeholder="email"
                      type="email"
                      value="support@growsphere.app"
                      readOnly
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">All Invoices</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setInvoiceFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  invoiceFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setInvoiceFilter("paid")}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  invoiceFilter === "paid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setInvoiceFilter("open")}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  invoiceFilter === "open"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                Open
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                    Invoice
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                    Member
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-3 px-4">
                    Amount
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-3 px-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      #INV-{payment.id.slice(0, 4).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {payment.member.firstName} {payment.member.lastName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.status.toLowerCase() === "paid"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-yellow-500/20 text-yellow-500"
                        }`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground text-right font-medium">
                      {formatAmount(payment.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === "payment-methods" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Payment Methods
              </h3>
              <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors">
                Add Payment Method
              </button>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {method.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        •••• •••• •••• {method.last4}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Expires</p>
                      <p className="text-sm font-medium text-foreground">
                        {method.expires}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {method.isDefault ? (
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs font-semibold">
                          Default
                        </span>
                      ) : (
                        <button className="px-3 py-1 bg-secondary/50 hover:bg-secondary rounded-lg text-xs font-medium transition-colors">
                          Make Default
                        </button>
                      )}
                      <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg text-xs font-medium transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === "usage" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Active Members</p>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {usageStats.activeMembers}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Updated daily
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Locations</p>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {usageStats.locations}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Total active locations
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">SMS Sent</p>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {usageStats.smsSent.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This month
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Emails Sent</p>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {usageStats.emailsSent.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This month
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Usage Details
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your current plan includes unlimited members and 10,000 SMS messages per month.
              Usage resets on the 28th of each month.
            </p>
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                💡 Upgrade to our Enterprise plan for unlimited SMS, custom branding, and dedicated support.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
