"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import styles from "./AdminSubscribersDashboard.module.css";

export type SubscriberRow = {
  id: number;
  email: string;
  subscribedAt: string;
  unsubscribed: boolean;
};

export type DailyPoint = {
  date: string; // YYYY-MM-DD (UTC)
  newSubscribers: number;
};

type Props = {
  subscribers: SubscriberRow[];
  daily: DailyPoint[];
};

type RangeKey = "30" | "90" | "365" | "all";

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCsvRow(values: string[]) {
  return values
    .map((value) => `"${String(value).split('"').join('""')}"`)
    .join(",");
}

function buildSubscriberCsv(rows: SubscriberRow[]) {
  const header = toCsvRow(["id", "email", "subscribedAt", "unsubscribed"]);
  const body = rows.map((row) =>
    toCsvRow([
      String(row.id),
      row.email,
      row.subscribedAt,
      row.unsubscribed ? "true" : "false",
    ])
  );
  return [header, ...body].join("\n");
}

function parseIsoDate(date: string): Date {
  const parsed = d3.utcParse("%Y-%m-%d")(date);
  return parsed ?? new Date(`${date}T00:00:00.000Z`);
}

function computeCumulative(points: DailyPoint[]) {
  let total = 0;
  return points.map((p) => {
    total += p.newSubscribers;
    return { ...p, cumulative: total };
  });
}

export default function AdminSubscribersDashboard({ subscribers, daily }: Props) {
  const [query, setQuery] = useState("");
  const [showUnsubscribed, setShowUnsubscribed] = useState(true);
  const [sortKey, setSortKey] = useState<"date" | "email">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [range, setRange] = useState<RangeKey>("90");

  const chartWrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const filteredSubscribers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const base = subscribers.filter((row) => {
      if (!showUnsubscribed && row.unsubscribed) return false;
      if (!needle) return true;
      return row.email.toLowerCase().includes(needle);
    });

    const sorted = [...base].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "email") {
        return a.email.localeCompare(b.email) * dir;
      }
      const aTime = new Date(a.subscribedAt).getTime();
      const bTime = new Date(b.subscribedAt).getTime();
      return (aTime - bTime) * dir;
    });

    return sorted;
  }, [query, showUnsubscribed, sortDir, sortKey, subscribers]);

  const activeCount = useMemo(
    () => subscribers.filter((s) => !s.unsubscribed).length,
    [subscribers]
  );

  const dailyForRange = useMemo(() => {
    if (daily.length === 0) return [];
    if (range === "all") return daily;
    const days = Number(range);
    const slice = daily.slice(Math.max(0, daily.length - days));
    return slice;
  }, [daily, range]);

  const chartData = useMemo(
    () => computeCumulative(dailyForRange),
    [dailyForRange]
  );

  useEffect(() => {
    const wrap = chartWrapRef.current;
    const svgEl = svgRef.current;
    const tooltipEl = tooltipRef.current;
    if (!wrap || !svgEl || !tooltipEl) return;

    const render = () => {
      const tooltip = tooltipRef.current;
      const svgNode = svgRef.current;
      const wrapNode = chartWrapRef.current;
      if (!tooltip || !svgNode || !wrapNode) return;
      const tooltipEl = tooltip;
      const wrapEl = wrapNode;

      const width = wrap.clientWidth;
      const height = 320;
      const margin = { top: 16, right: 18, bottom: 36, left: 44 };

      const svg = d3.select(svgNode);
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);

      const innerWidth = Math.max(1, width - margin.left - margin.right);
      const innerHeight = Math.max(1, height - margin.top - margin.bottom);

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      if (chartData.length === 0) {
        g.append("text")
          .attr("x", 0)
          .attr("y", 20)
          .attr("fill", "currentColor")
          .style("opacity", 0.7)
          .text("No subscriber data yet.");
        return;
      }

      const x = d3
        .scaleUtc()
        .domain(
          d3.extent(chartData, (d: any) => parseIsoDate(d.date)) as [Date, Date]
        )
        .range([0, innerWidth]);

      const maxNew = d3.max(chartData, (d: any) => d.newSubscribers) ?? 0;
      const maxCumulative = d3.max(chartData, (d: any) => d.cumulative) ?? 0;

      const yBars = d3
        .scaleLinear()
        .domain([0, Math.max(1, maxNew)])
        .range([innerHeight, innerHeight * 0.55]);

      const yLine = d3
        .scaleLinear()
        .domain([0, Math.max(1, maxCumulative)])
        .nice()
        .range([innerHeight * 0.55, 0]);

      const xAxis = d3.axisBottom(x).ticks(6).tickSizeOuter(0);
      const yAxis = d3.axisLeft(yLine).ticks(5).tickSizeOuter(0);

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .call((sel: any) => sel.selectAll("text").style("font-size", "12px"))
        .call((sel: any) => sel.selectAll("path,line").style("opacity", 0.4));

      g.append("g")
        .call(yAxis)
        .call((sel: any) => sel.selectAll("text").style("font-size", "12px"))
        .call((sel: any) => sel.selectAll("path,line").style("opacity", 0.4));

      g.append("g")
        .attr("transform", `translate(${innerWidth - 2}, 0)`)
        .append("text")
        .attr("text-anchor", "end")
        .attr("fill", "currentColor")
        .style("font-size", "12px")
        .style("opacity", 0.7)
        .text("Cumulative");

      const barWidth = Math.max(1, innerWidth / chartData.length);
      const bars = g.append("g").attr("opacity", 0.9);
      bars
        .selectAll("rect")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("x", (d: any) => x(parseIsoDate(d.date)) - barWidth * 0.45)
        .attr("y", (d: any) => yBars(d.newSubscribers))
        .attr("width", barWidth * 0.9)
        .attr("height", (d: any) => innerHeight - yBars(d.newSubscribers))
        .attr("rx", 2)
        .attr("fill", "currentColor")
        .style("opacity", 0.18);

      const line = d3
        .line()
        .x((d: any) => x(parseIsoDate(d.date)))
        .y((d: any) => yLine(d.cumulative))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(chartData)
        .attr("fill", "none")
        .attr("stroke", "currentColor")
        .attr("stroke-width", 2)
        .attr("d", line);

      const overlay = g
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "transparent");

      const focusLine = g
        .append("line")
        .style("display", "none")
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "currentColor")
        .attr("stroke-width", 1)
        .style("opacity", 0.25);

      const focusDot = g
        .append("circle")
        .style("display", "none")
        .attr("r", 5)
        .attr("fill", "currentColor");

      const bisect = d3
        .bisector((d: any) => parseIsoDate(d.date))
        .center;

      function showTooltip(d: (DailyPoint & { cumulative: number }), xPos: number) {
        const date = parseIsoDate(d.date);
        const dateLabel = d3.utcFormat("%b %d, %Y")(date);
        tooltipEl.innerHTML = `
          <div class="${styles.tooltipTitle}">${dateLabel}</div>
          <div class="${styles.tooltipRow}">
            <span>New</span><span>${formatNumber(d.newSubscribers)}</span>
          </div>
          <div class="${styles.tooltipRow}">
            <span>Cumulative</span><span>${formatNumber(d.cumulative)}</span>
          </div>
        `;
        const wrapRect = wrapEl.getBoundingClientRect();
        tooltipEl.style.left = `${Math.min(
          wrapRect.width - 12,
          margin.left + xPos + 12
        )}px`;
        tooltipEl.style.top = `${margin.top + 8}px`;
        tooltipEl.style.opacity = "1";
      }

      overlay
        .on("mouseenter", () => {
          focusLine.style("display", null);
          focusDot.style("display", null);
          tooltipEl.style.opacity = "1";
        })
        .on("mouseleave", () => {
          focusLine.style("display", "none");
          focusDot.style("display", "none");
          tooltipEl.style.opacity = "0";
        })
        .on("mousemove", (event: any) => {
          const [mx] = d3.pointer(event);
          const hoveredDate = x.invert(mx);
          const index = bisect(chartData, hoveredDate);
          const point = chartData[index];
          const xPos = x(parseIsoDate(point.date));
          focusLine.attr("x1", xPos).attr("x2", xPos);
          focusDot.attr("cx", xPos).attr("cy", yLine(point.cumulative));
          showTooltip(point, xPos);
        });
    };

    const ro = new ResizeObserver(() => render());
    ro.observe(wrap);
    render();
    return () => ro.disconnect();
  }, [chartData]);

  function toggleSort(nextKey: "date" | "email") {
    if (sortKey !== nextKey) {
      setSortKey(nextKey);
      setSortDir("desc");
      return;
    }
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  return (
    <div className={styles.grid}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Growth</h2>
          <div className={styles.range}>
            {(["30", "90", "365", "all"] as RangeKey[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`${styles.rangeButton} ${
                  range === key ? styles.rangeButtonActive : ""
                }`}
                onClick={() => setRange(key)}
              >
                {key === "all" ? "All" : `${key}d`}
              </button>
            ))}
          </div>
        </div>
        <p className={styles.panelMeta}>
          Active: <strong>{formatNumber(activeCount)}</strong> · Rows:{" "}
          <strong>{formatNumber(subscribers.length)}</strong>
        </p>
        <div className={styles.chartWrap} ref={chartWrapRef}>
          <svg ref={svgRef} role="img" aria-label="Subscriber growth chart" />
          <div className={styles.tooltip} ref={tooltipRef} />
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Subscribers</h2>
          <button
            type="button"
            className={styles.exportButton}
            onClick={() => {
              const csv = buildSubscriberCsv(filteredSubscribers);
              downloadText(`subscribers-${new Date().toISOString().slice(0, 10)}.csv`, csv);
            }}
          >
            Export CSV
          </button>
        </div>

        <div className={styles.controls}>
          <input
            className={styles.search}
            placeholder="Search email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={showUnsubscribed}
              onChange={(e) => setShowUnsubscribed(e.target.checked)}
            />
            Include unsubscribed
          </label>
        </div>

        <p className={styles.tableMeta}>
          Showing <strong>{formatNumber(filteredSubscribers.length)}</strong> of{" "}
          <strong>{formatNumber(subscribers.length)}</strong>
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => toggleSort("email")}
                  >
                    Email {sortKey === "email" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => toggleSort("date")}
                  >
                    Subscribed{" "}
                    {sortKey === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((row) => (
                <tr key={row.id}>
                  <td className={styles.emailCell}>{row.email}</td>
                  <td>{new Date(row.subscribedAt).toLocaleString()}</td>
                  <td>{row.unsubscribed ? "Unsubscribed" : "Active"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
