"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { Invoice } from "@/lib/types";
import { formatBDT, formatDateTime } from "@/lib/format";
import InvoiceDocument from "@/components/InvoiceDocument";
import {
  BanknoteIcon,
  CalendarIcon,
  ChartIcon,
  ClockIcon,
  HomeIcon,
  PrinterIcon,
  ReceiptIcon,
  SearchIcon,
} from "@/components/icons";
import { CloseButton } from "@/components/Header";

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfWeek(date: Date): Date {
  const result = startOfDay(date);
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  return result;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function inRange(invoice: Invoice, from: Date | null, to: Date | null): boolean {
  const time = new Date(invoice.createdAt).getTime();
  if (from && time < from.getTime()) return false;
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (time > end.getTime()) return false;
  }
  return true;
}

interface Stats {
  total: number;
  today: number;
  week: number;
  thirtyDays: number;
  month: number;
  count: number;
}

export default function InvoicesPage() {
  const { invoices, seedInvoices } = useStore();
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [method, setMethod] = useState("all");
  const [sortKey, setSortKey] = useState<"newest" | "oldest" | "amount-desc" | "amount-asc">(
    "newest"
  );
  const [selected, setSelected] = useState<Invoice | null>(null);

  const stats = useMemo<Stats>(() => {
    const now = new Date();
    const today = startOfDay(now);
    const week = startOfWeek(now);
    const month = startOfMonth(now);
    const thirty = new Date(now);
    thirty.setDate(thirty.getDate() - 30);

    let total = 0;
    let todayTotal = 0;
    let weekTotal = 0;
    let monthTotal = 0;
    let thirtyTotal = 0;

    for (const invoice of invoices) {
      const time = new Date(invoice.createdAt).getTime();
      total += invoice.total;
      if (time >= today.getTime()) todayTotal += invoice.total;
      if (time >= week.getTime()) weekTotal += invoice.total;
      if (time >= month.getTime()) monthTotal += invoice.total;
      if (time >= thirty.getTime()) thirtyTotal += invoice.total;
    }

    return {
      total,
      today: todayTotal,
      week: weekTotal,
      thirtyDays: thirtyTotal,
      month: monthTotal,
      count: invoices.length,
    };
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;
    if (from) fromDate = new Date(`${from}T00:00:00`);
    if (to) toDate = new Date(`${to}T00:00:00`);

    let list = invoices.filter((invoice) => {
      if (method !== "all" && invoice.paymentMethod !== method) return false;
      if (!inRange(invoice, fromDate, toDate)) return false;
      if (q) {
        const haystack = [
          invoice.id,
          invoice.paymentMethod,
          ...invoice.items.map((item) => item.name),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    switch (sortKey) {
      case "newest":
        list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "oldest":
        list = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case "amount-desc":
        list = [...list].sort((a, b) => b.total - a.total);
        break;
      case "amount-asc":
        list = [...list].sort((a, b) => a.total - b.total);
        break;
    }
    return list;
  }, [invoices, query, from, to, method, sortKey]);

  const methods = useMemo(
    () => [...new Set(invoices.map((invoice) => invoice.paymentMethod))].sort(),
    [invoices]
  );

  const statCards = [
    {
      label: "Total revenue",
      value: stats.total,
      icon: <BanknoteIcon width={20} height={20} />,
      note: `${stats.count.toLocaleString()} invoices`,
    },
    {
      label: "Today",
      value: stats.today,
      icon: <ClockIcon width={20} height={20} />,
      note: "Since 00:00",
    },
    {
      label: "This week",
      value: stats.week,
      icon: <CalendarIcon width={20} height={20} />,
      note: "Since Monday",
    },
    {
      label: "Last 30 days",
      value: stats.thirtyDays,
      icon: <ChartIcon width={20} height={20} />,
      note: "Rolling window",
    },
    {
      label: "This month",
      value: stats.month,
      icon: <CalendarIcon width={20} height={20} />,
      note: "Month to date",
    },
  ];

  return (
    <div className="app-shell">
      <div className="main">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
              Invoices & Revenue
            </h1>
            <p className="muted" style={{ fontSize: 13, margin: "2px 0 0" }}>
              {filtered.length.toLocaleString()} of {invoices.length.toLocaleString()} invoices shown
            </p>
          </div>
          <div className="spacer" />
          <Link href="/" className="btn btn-secondary">
            <HomeIcon width={16} height={16} />
            Back to inventory
          </Link>
          <div className="search-bar">
            <span className="search-icon">
              <SearchIcon width={16} height={16} />
            </span>
            <input
              className="input"
              placeholder="Search invoice or product…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {statCards.map((card) => (
            <div className="card stat-card" key={card.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="faint">{card.icon}</span>
                <span className="card-label">{card.label}</span>
              </div>
              <span className="stat-value mono">{formatBDT(card.value)}</span>
              <span className="faint" style={{ fontSize: 12 }}>
                {card.note}
              </span>
            </div>
          ))}
        </div>

        <div className="filter-bar card" style={{ padding: 14, marginBottom: 20 }}>
          <input
            type="date"
            className="input"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            aria-label="From date"
          />
          <span className="faint">→</span>
          <input
            type="date"
            className="input"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            aria-label="To date"
          />
          <select
            className="select"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            aria-label="Filter by payment method"
          >
            <option value="all">All payment methods</option>
            {methods.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="spacer" />
          <select
            className="select"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
            aria-label="Sort invoices"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amount-desc">Amount (high → low)</option>
            <option value="amount-asc">Amount (low → high)</option>
          </select>
        </div>

        {invoices.length === 0 ? (
          <div className="card empty-state">
            <ReceiptIcon width={36} height={36} />
            <p className="muted">
              No invoices yet. Complete a sale from the POS counter,
              <br />
              or load demo data to see the revenue dashboard in action.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                seedInvoices();
              }}
            >
              Seed demo invoices
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <SearchIcon width={36} height={36} />
            <p className="muted">No invoices match the current filters.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date & time</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th className="num">Total</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => (
                  <tr key={invoice.id} className="clickable" onClick={() => setSelected(invoice)}>
                    <td className="font-mono-data" style={{ fontWeight: 600 }}>
                      {invoice.id}
                    </td>
                    <td className="font-mono-data">{formatDateTime(invoice.createdAt)}</td>
                    <td className="font-mono-data">{invoice.items.length}</td>
                    <td>
                      <span className="chip chip-soft">{invoice.paymentMethod}</span>
                    </td>
                    <td className="num font-mono-data" style={{ fontWeight: 600 }}>
                      {formatBDT(invoice.total)}
                    </td>
                    <td className="num">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelected(invoice);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div
            className="modal"
            style={{ maxWidth: 800 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="section-title">Invoice {selected.id}</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                  <PrinterIcon width={14} height={14} />
                  Print
                </button>
                <CloseButton onClick={() => setSelected(null)} />
              </div>
            </div>
            <div className="modal-body">
              <InvoiceDocument invoice={selected} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}