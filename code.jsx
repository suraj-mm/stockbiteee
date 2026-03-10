import { useState, useEffect, useRef } from "react";

const NSE_STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy" },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT" },
  { symbol: "INFY", name: "Infosys", sector: "IT" },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking" },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG" },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", sector: "Finance" },
  { symbol: "WIPRO", name: "Wipro", sector: "IT" },
  { symbol: "ADANIENT", name: "Adani Enterprises", sector: "Conglomerate" },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto" },
  { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto" },
  { symbol: "SUNPHARMA", name: "Sun Pharma", sector: "Pharma" },
  { symbol: "ONGC", name: "ONGC", sector: "Energy" },
  { symbol: "POWERGRID", name: "Power Grid", sector: "Utilities" },
];

const BASE_PRICES = {
  RELIANCE: 2890, TCS: 4120, INFY: 1780, HDFCBANK: 1640,
  ICICIBANK: 1190, HINDUNILVR: 2430, SBIN: 780, BAJFINANCE: 7250,
  WIPRO: 560, ADANIENT: 3100, TATAMOTORS: 980, MARUTI: 12400,
  SUNPHARMA: 1680, ONGC: 280, POWERGRID: 340,
};

const FNO_LIST = [
  { symbol: "NIFTY", name: "Nifty 50", lotSize: 25 },
  { symbol: "BANKNIFTY", name: "Bank Nifty", lotSize: 15 },
  { symbol: "RELIANCE", name: "Reliance", lotSize: 250 },
  { symbol: "TCS", name: "TCS", lotSize: 150 },
  { symbol: "INFY", name: "Infosys", lotSize: 300 },
  { symbol: "HDFCBANK", name: "HDFC Bank", lotSize: 550 },
];

const MUTUAL_FUNDS = [
  { id: "mf1", name: "Mirae Asset Large Cap Fund", category: "Large Cap", nav: 98.45, ret: 18.2, risk: "Low" },
  { id: "mf2", name: "Axis Bluechip Fund", category: "Large Cap", nav: 62.30, ret: 15.8, risk: "Low" },
  { id: "mf3", name: "SBI Small Cap Fund", category: "Small Cap", nav: 145.67, ret: 32.1, risk: "High" },
  { id: "mf4", name: "HDFC Mid-Cap Opportunities", category: "Mid Cap", nav: 88.92, ret: 24.5, risk: "Medium" },
  { id: "mf5", name: "Parag Parikh Flexi Cap", category: "Flexi Cap", nav: 73.21, ret: 20.3, risk: "Medium" },
  { id: "mf6", name: "Quant Active Fund", category: "Multi Cap", nav: 540.33, ret: 41.2, risk: "High" },
  { id: "mf7", name: "Kotak Emerging Equity", category: "Mid Cap", nav: 110.45, ret: 28.7, risk: "Medium" },
  { id: "mf8", name: "ICICI Pru Technology Fund", category: "Sector", nav: 205.88, ret: 12.4, risk: "High" },
];

function rnd(base, vol) {
  var v = vol || 0.02;
  return parseFloat((base * (1 + (Math.random() - 0.5) * v)).toFixed(2));
}

function fmtINR(n) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n);
}

function fmtNum(n) {
  return new Intl.NumberFormat("en-IN").format(n);
}

function makeTick(sym) {
  var base = BASE_PRICES[sym] || 1000;
  var price = rnd(base, 0.03);
  var change = parseFloat((price - base).toFixed(2));
  var pct = parseFloat(((change / base) * 100).toFixed(2));
  return {
    price: price,
    change: change,
    pct: pct,
    volume: Math.floor(Math.random() * 5000000 + 500000),
    high: parseFloat((base * 1.02).toFixed(2)),
    low: parseFloat((base * 0.98).toFixed(2)),
    open: base
  };
}

function makeCandles(base, count) {
  var cnt = count || 50;
  var out = [];
  var cur = base;
  var now = Date.now();
  for (var i = cnt; i >= 0; i--) {
    var open = cur;
    var close = parseFloat((open + (Math.random() - 0.48) * base * 0.012).toFixed(2));
    var high = parseFloat((Math.max(open, close) * (1 + Math.random() * 0.005)).toFixed(2));
    var low = parseFloat((Math.min(open, close) * (1 - Math.random() * 0.005)).toFixed(2));
    out.push({ time: now - i * 60000, open: open, high: high, low: low, close: close });
    cur = close;
  }
  return out;
}

function aiSignal(candles) {
  if (!candles || candles.length < 10) {
    return { signal: "HOLD", conf: 50, reason: "Insufficient data", sma5: 0, sma10: 0 };
  }
  var prices = candles.slice(-10).map(function(c) { return c.close; });
  var sma5 = prices.slice(-5).reduce(function(a, b) { return a + b; }, 0) / 5;
  var sma10 = prices.reduce(function(a, b) { return a + b; }, 0) / 10;
  var mom = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
  var signal = "HOLD";
  var conf = 50;
  var reason = "Sideways trend";
  if (sma5 > sma10 && mom > 0.5) {
    signal = "BUY";
    conf = Math.min(88, 60 + mom * 5);
    reason = "Bullish crossover. Momentum +" + mom.toFixed(2) + "%";
  } else if (sma5 < sma10 && mom < -0.5) {
    signal = "SELL";
    conf = Math.min(88, 60 + Math.abs(mom) * 5);
    reason = "Bearish crossover. Momentum " + mom.toFixed(2) + "%";
  }
  return {
    signal: signal,
    conf: parseFloat(conf.toFixed(1)),
    reason: reason,
    sma5: parseFloat(sma5.toFixed(2)),
    sma10: parseFloat(sma10.toFixed(2))
  };
}

function Spark(props) {
  var data = props.data;
  var color = props.color || "#22c55e";
  var w = props.w || 80;
  var h = props.h || 28;
  if (!data || data.length < 2) return null;
  var mn = Math.min.apply(null, data);
  var mx = Math.max.apply(null, data);
  var rng = mx - mn || 1;
  var pts = data.map(function(v, i) {
    return (i / (data.length - 1)) * w + "," + (h - ((v - mn) / rng) * h);
  }).join(" ");
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function CandleChart(props) {
  var candles = props.candles;
  if (!candles || candles.length === 0) return null;
  var W = 600; var H = 210; var PL = 52; var PT = 10; var PB = 22; var PR = 8;
  var w = W - PL - PR;
  var h = H - PT - PB;
  var prices = [];
  candles.forEach(function(c) { prices.push(c.high); prices.push(c.low); });
  var mn = Math.min.apply(null, prices);
  var mx = Math.max.apply(null, prices);
  var rng = mx - mn || 1;
  var sy = function(v) { return h - ((v - mn) / rng) * h; };
  var cw = Math.max(2, (w / candles.length) * 0.7);
  var ticks = [0, 1, 2, 3, 4].map(function(i) {
    var val = mn + (rng * i) / 4;
    var y = sy(val);
    return { val: val.toFixed(0), y: y };
  });
  return (
    <svg width="100%" viewBox={"0 0 " + W + " " + H}>
      <rect width={W} height={H} fill="#080f1e" rx="8" />
      <g transform={"translate(" + PL + "," + PT + ")"}>
        {ticks.map(function(t, i) {
          return (
            <g key={i}>
              <line x1={0} y1={t.y} x2={w} y2={t.y} stroke="#1e293b" strokeWidth="1" />
              <text x={-5} y={t.y + 4} textAnchor="end" fill="#475569" fontSize="10">{t.val}</text>
            </g>
          );
        })}
        {candles.map(function(c, i) {
          var x = (i / candles.length) * w + cw / 2;
          var up = c.close >= c.open;
          var col = up ? "#22c55e" : "#ef4444";
          var by = sy(Math.max(c.open, c.close));
          var bh = Math.max(1, Math.abs(sy(c.open) - sy(c.close)));
          return (
            <g key={i}>
              <line x1={x} y1={sy(c.high)} x2={x} y2={sy(c.low)} stroke={col} strokeWidth="1" />
              <rect x={x - cw / 2} y={by} width={cw} height={bh} fill={col} opacity="0.85" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default function StockBite() {
  var [page, setPage] = useState("home");
  var [prices, setPrices] = useState({});
  var [sparks, setSparks] = useState({});
  var [selStock, setSelStock] = useState(null);
  var [wallet, setWallet] = useState(100000);
  var [portfolio, setPortfolio] = useState([]);
  var [orders, setOrders] = useState([]);
  var [aiOrders, setAiOrders] = useState([]);
  var [mfHoldings, setMfHoldings] = useState([]);
  var [txHistory, setTxHistory] = useState([{ type: "CREDIT", amount: 100000, date: "01/01/2025", note: "Initial deposit" }]);
  var [lossLimit, setLossLimit] = useState(5000);
  var [pendingAI, setPendingAI] = useState(null);
  var [showAIModal, setShowAIModal] = useState(false);
  var [notif, setNotif] = useState(null);
  var [chatOpen, setChatOpen] = useState(false);
  var [chatMsgs, setChatMsgs] = useState([{ role: "bot", text: "Namaste! I am StockBite AI. Ask me anything about NSE/BSE stocks, F&O, Nifty, or trading strategies!" }]);
  var [chatInput, setChatInput] = useState("");
  var [nifty, setNifty] = useState(24250);
  var [sensex, setSensex] = useState(79890);
  var [orderSide, setOrderSide] = useState("BUY");
  var [orderQty, setOrderQty] = useState(1);
  var [orderType, setOrderType] = useState("MARKET");
  var [profileTab, setProfileTab] = useState("overview");
  var [txAmt, setTxAmt] = useState("");
  var timerRef = useRef(null);

  useEffect(function() {
    var init = {};
    var sp = {};
    NSE_STOCKS.forEach(function(s) {
      init[s.symbol] = makeTick(s.symbol);
      sp[s.symbol] = Array.from({ length: 20 }, function() { return rnd(BASE_PRICES[s.symbol] || 1000, 0.01); });
    });
    setPrices(init);
    setSparks(sp);
    timerRef.current = setInterval(function() {
      setPrices(function(prev) {
        var u = Object.assign({}, prev);
        NSE_STOCKS.forEach(function(s) { u[s.symbol] = makeTick(s.symbol); });
        return u;
      });
      setSparks(function(prev) {
        var u = Object.assign({}, prev);
        NSE_STOCKS.forEach(function(s) {
          var arr = prev[s.symbol] || [];
          var last = arr[arr.length - 1] || 1000;
          u[s.symbol] = arr.slice(-19).concat([rnd(last, 0.01)]);
        });
        return u;
      });
      setNifty(function(v) { return rnd(v, 0.003); });
      setSensex(function(v) { return rnd(v, 0.003); });
    }, 3000);
    return function() { clearInterval(timerRef.current); };
  }, []);

  useEffect(function() {
    var t = setInterval(function() {
      var stock = NSE_STOCKS[Math.floor(Math.random() * 5)];
      setPrices(function(curPrices) {
        var d = curPrices[stock.symbol];
        if (d) {
          var pred = aiSignal(makeCandles(d.price));
          if (pred.signal !== "HOLD" && pred.conf > 70) {
            setPendingAI(Object.assign({}, stock, d, { signal: pred.signal, conf: pred.conf, reason: pred.reason }));
            setShowAIModal(true);
          }
        }
        return curPrices;
      });
    }, 30000);
    return function() { clearInterval(t); };
  }, []);

  function toast(msg, type) {
    setNotif({ msg: msg, type: type || "ok" });
    setTimeout(function() { setNotif(null); }, 3500);
  }

  function execOrder(symbol, side, qty, price, isAI) {
    var cost = price * qty;
    if (side === "BUY") {
      setWallet(function(w) {
        if (cost > w) { toast("Insufficient wallet balance!", "err"); return w; }
        return parseFloat((w - cost).toFixed(2));
      });
      setPortfolio(function(prev) {
        var ex = prev.find(function(p) { return p.symbol === symbol; });
        if (ex) {
          return prev.map(function(p) {
            if (p.symbol === symbol) {
              return Object.assign({}, p, { qty: p.qty + qty, avg: parseFloat(((p.avg * p.qty + price * qty) / (p.qty + qty)).toFixed(2)) });
            }
            return p;
          });
        }
        var name = (NSE_STOCKS.find(function(s) { return s.symbol === symbol; }) || {}).name || symbol;
        return prev.concat([{ symbol: symbol, name: name, qty: qty, avg: price }]);
      });
    } else {
      setWallet(function(w) { return parseFloat((w + cost).toFixed(2)); });
      setPortfolio(function(prev) {
        return prev.map(function(p) {
          if (p.symbol === symbol) return Object.assign({}, p, { qty: p.qty - qty });
          return p;
        }).filter(function(p) { return p.qty > 0; });
      });
    }
    var o = { id: Date.now(), symbol: symbol, side: side, qty: qty, price: price, isAI: isAI || false, timestamp: new Date().toLocaleString("en-IN"), status: "EXECUTED" };
    setOrders(function(prev) { return [o].concat(prev); });
    toast(side + " " + qty + " x " + symbol + " @ Rs." + price.toFixed(2) + (isAI ? " (AI)" : ""), "ok");
  }

  function confirmAI() {
    if (pendingAI) {
      execOrder(pendingAI.symbol, pendingAI.signal, 1, pendingAI.price, true);
      var aiO = Object.assign({}, pendingAI, { status: "EXECUTED", time: new Date().toLocaleString("en-IN") });
      setAiOrders(function(prev) { return [aiO].concat(prev); });
    }
    setShowAIModal(false);
    setPendingAI(null);
  }

  function sendChat() {
    if (!chatInput.trim()) return;
    var msg = chatInput.trim();
    setChatMsgs(function(prev) { return prev.concat([{ role: "user", text: msg }]); });
    setChatInput("");
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: "You are StockBite, an expert Indian stock market AI. Help with NSE/BSE stocks, Nifty, Sensex, F&O, mutual funds. Be concise (2-4 sentences). Use Indian market context.",
        messages: [{ role: "user", content: msg }]
      })
    }).then(function(res) { return res.json(); }).then(function(data) {
      var reply = (data.content && data.content[0] && data.content[0].text) || "Markets are moving! Ask about specific NSE stocks or F&O strategies.";
      setChatMsgs(function(prev) { return prev.concat([{ role: "bot", text: reply }]); });
    }).catch(function() {
      setChatMsgs(function(prev) { return prev.concat([{ role: "bot", text: "Nifty is showing mixed signals today. Consider large-cap IT and banking stocks for stability." }]); });
    });
  }

  function investMF(fund, amt) {
    if (wallet < amt) { toast("Insufficient balance", "err"); return; }
    setWallet(function(w) { return parseFloat((w - amt).toFixed(2)); });
    setMfHoldings(function(prev) {
      var ex = prev.find(function(h) { return h.id === fund.id; });
      if (ex) {
        return prev.map(function(h) {
          if (h.id === fund.id) return Object.assign({}, h, { units: parseFloat((h.units + amt / fund.nav).toFixed(3)), invested: h.invested + amt });
          return h;
        });
      }
      return prev.concat([Object.assign({}, fund, { units: parseFloat((amt / fund.nav).toFixed(3)), invested: amt })]);
    });
    toast("Invested Rs." + fmtNum(amt) + " in " + fund.name);
  }

  function creditWallet() {
    var a = parseFloat(txAmt);
    if (!a || a <= 0) return;
    setWallet(function(w) { return parseFloat((w + a).toFixed(2)); });
    setTxHistory(function(p) { return [{ type: "CREDIT", amount: a, date: new Date().toLocaleDateString("en-IN"), note: "Manual deposit" }].concat(p); });
    toast("Rs." + fmtNum(a) + " credited!");
    setTxAmt("");
  }

  function debitWallet() {
    var a = parseFloat(txAmt);
    if (!a || a <= 0 || a > wallet) { toast("Invalid amount or insufficient balance", "err"); return; }
    setWallet(function(w) { return parseFloat((w - a).toFixed(2)); });
    setTxHistory(function(p) { return [{ type: "DEBIT", amount: a, date: new Date().toLocaleDateString("en-IN"), note: "Manual withdrawal" }].concat(p); });
    toast("Rs." + fmtNum(a) + " withdrawn!");
    setTxAmt("");
  }

  var portValue = portfolio.reduce(function(a, p) { return a + ((prices[p.symbol] && prices[p.symbol].price) || p.avg) * p.qty; }, 0);
  var portCost = portfolio.reduce(function(a, p) { return a + p.avg * p.qty; }, 0);
  var portPnL = portValue - portCost;

  var C = {
    app: { background: "#020617", minHeight: "100vh", color: "#e2e8f0", fontFamily: "Segoe UI, sans-serif", display: "flex", flexDirection: "column" },
    hdr: { background: "#050d1a", borderBottom: "1px solid #1e293b", padding: "0 18px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
    nav: { background: "#050d1a", borderBottom: "1px solid #1e293b", padding: "4px 14px", display: "flex", gap: 2, overflowX: "auto" },
    main: { flex: 1, overflowY: "auto", padding: 18 },
    card: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16 },
    row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e293b" },
    lbl: { fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5, display: "block" },
    inp: { background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", padding: "9px 12px", borderRadius: 8, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
    bG: { background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "white", border: "none", padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
    bR: { background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "white", border: "none", padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
    bB: { background: "linear-gradient(135deg,#0284c7,#38bdf8)", color: "white", border: "none", padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
    bP: { background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "white", border: "none", padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
    mono: { fontFamily: "Consolas, monospace" },
    g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
    g4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 },
    fl: { display: "flex", alignItems: "center" },
    sec: { fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  };

  function badge(color, text) {
    return <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + "22", color: color }}>{text}</span>;
  }

  function navBtn(id, label) {
    var active = page === id;
    return (
      <button key={id} style={{ background: active ? "#1e293b" : "none", color: active ? "#38bdf8" : "#94a3b8", border: "none", padding: "8px 13px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }} onClick={function() { setPage(id); }}>
        {label}
      </button>
    );
  }

  function StatCard(props) {
    return (
      <div style={{ background: "#0f172a", border: "1px solid " + props.color + "30", borderRadius: 10, padding: 14 }}>
        <div style={C.lbl}>{props.label}</div>
        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "Consolas,monospace", color: props.color }}>{props.val}</div>
      </div>
    );
  }

  // ── HOME ──────────────────────────────────────────────────
  function HomePage() {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ background: "linear-gradient(135deg,#0c1a2e,#0f1d35)", border: "1px solid #1e3a5f", borderRadius: 18, padding: 34, marginBottom: 18 }}>
          <div style={{ marginBottom: 8, display: "flex", gap: 10, alignItems: "center" }}>
            {badge("#a78bfa", "AI-POWERED")}
            <span style={{ fontSize: 12, color: "#475569" }}>NSE · BSE · F&O · MF</span>
            <span style={{ fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />LIVE
            </span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>
            Trade Smarter with{" "}
            <span style={{ background: "linear-gradient(90deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Predictions</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>StockBite monitors NSE/BSE in real-time and executes orders before the market reacts.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={C.bB} onClick={function() { setPage("stocks"); }}>Start Trading</button>
            <button style={C.bP} onClick={function() { setChatOpen(true); }}>Ask StockBite AI</button>
          </div>
        </div>
        <div style={C.g4}>
          <StatCard label="Wallet Balance" val={fmtINR(wallet)} color="#38bdf8" />
          <StatCard label="Portfolio Value" val={fmtINR(portValue)} color="#22c55e" />
          <StatCard label="Total P&L" val={fmtINR(portPnL)} color={portPnL >= 0 ? "#22c55e" : "#ef4444"} />
          <StatCard label="AI Orders" val={aiOrders.length} color="#a78bfa" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginTop: 18 }}>
          <div style={C.card}>
            <div style={C.sec}>Watchlist</div>
            {["RELIANCE", "TCS", "HDFCBANK", "INFY"].map(function(sym) {
              var d = prices[sym];
              var s = NSE_STOCKS.find(function(x) { return x.symbol === sym; });
              if (!d || !s) return null;
              return (
                <div key={sym} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #1e293b", cursor: "pointer" }}
                  onClick={function() { setSelStock(Object.assign({}, s, { data: d, candles: makeCandles(d.price) })); setPage("stocks"); }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{sym}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{s.sector}</div>
                  </div>
                  <Spark data={sparks[sym]} color={d.pct >= 0 ? "#22c55e" : "#ef4444"} />
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "Consolas,monospace", fontWeight: 600 }}>Rs.{d.price.toFixed(2)}</div>
                    {badge(d.pct >= 0 ? "#22c55e" : "#ef4444", (d.pct >= 0 ? "+" : "") + d.pct + "%")}
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <div style={Object.assign({}, C.card, { marginBottom: 14 })}>
              <div style={C.sec}>AI Engine Status</div>
              <div style={{ background: "#052e16", border: "1px solid #166534", borderRadius: 8, padding: 12, display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>AI Engine Active</div>
                  <div style={{ fontSize: 11, color: "#166534" }}>Scanning 15 NSE stocks</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#475569" }}>Loss Limit</span>
                <span style={{ fontFamily: "Consolas,monospace", color: "#fde047", fontWeight: 700 }}>Rs.{fmtNum(lossLimit)}</span>
              </div>
            </div>
            <div style={C.card}>
              <div style={C.sec}>Recent AI Orders</div>
              {aiOrders.length === 0
                ? <div style={{ color: "#334155", fontSize: 13, textAlign: "center", padding: "14px 0" }}>No AI orders yet. Scans every 30s.</div>
                : aiOrders.slice(0, 3).map(function(o, i) {
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e293b", fontSize: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{o.symbol}</div>
                        <div style={{ color: "#475569" }}>{o.time}</div>
                      </div>
                      {badge(o.signal === "BUY" ? "#22c55e" : "#ef4444", o.signal)}
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STOCKS ────────────────────────────────────────────────
  function StocksPage() {
    if (selStock) {
      var pred = aiSignal(selStock.candles);
      var sc = { BUY: "#22c55e", SELL: "#ef4444", HOLD: "#f59e0b" }[pred.signal];
      return (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <button style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", padding: "7px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 16, fontSize: 13 }} onClick={function() { setSelStock(null); }}>
            Back
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 16 }}>
            <div>
              <div style={Object.assign({}, C.card, { marginBottom: 14 })}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <h2 style={{ fontSize: 22, fontWeight: 800 }}>{selStock.symbol}</h2>
                      {badge(selStock.data.pct >= 0 ? "#22c55e" : "#ef4444", (selStock.data.pct >= 0 ? "+" : "") + selStock.data.pct + "%")}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{selStock.name} · {selStock.sector}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Consolas,monospace", color: selStock.data.pct >= 0 ? "#22c55e" : "#ef4444" }}>Rs.{selStock.data.price.toFixed(2)}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>H: {selStock.data.high} | L: {selStock.data.low}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                  {[["Open", "Rs." + selStock.data.open], ["High", "Rs." + selStock.data.high], ["Low", "Rs." + selStock.data.low], ["Volume", (selStock.data.volume / 1e6).toFixed(2) + "M"]].map(function(item) {
                    return (
                      <div key={item[0]} style={{ background: "#1e293b", borderRadius: 8, padding: "10px 12px" }}>
                        <div style={C.lbl}>{item[0]}</div>
                        <div style={{ fontFamily: "Consolas,monospace", fontWeight: 600 }}>{item[1]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={C.card}>
                <div style={C.sec}>Candlestick Chart</div>
                <CandleChart candles={selStock.candles} />
              </div>
            </div>
            <div>
              <div style={Object.assign({}, C.card, { marginBottom: 14 })}>
                <div style={C.sec}>Place Order</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 12, background: "#0f172a", padding: 4, borderRadius: 8 }}>
                  {["BUY", "SELL"].map(function(s) {
                    return <button key={s} style={{ flex: 1, background: orderSide === s ? "#1e293b" : "none", color: orderSide === s ? "#38bdf8" : "#64748b", border: "none", padding: "7px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }} onClick={function() { setOrderSide(s); }}>{s}</button>;
                  })}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={C.lbl}>Order Type</label>
                  <select style={C.inp} value={orderType} onChange={function(e) { setOrderType(e.target.value); }}>
                    <option value="MARKET">Market Order</option>
                    <option value="LIMIT">Limit Order</option>
                    <option value="SL">Stop Loss</option>
                  </select>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={C.lbl}>Quantity</label>
                  <input style={C.inp} type="number" min="1" value={orderQty} onChange={function(e) { setOrderQty(parseInt(e.target.value) || 1); }} />
                </div>
                <div style={{ background: "#1e293b", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: "#475569" }}>Est. Value</span>
                    <span style={{ fontFamily: "Consolas,monospace" }}>{fmtINR(selStock.data.price * orderQty)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#475569" }}>Wallet</span>
                    <span style={{ fontFamily: "Consolas,monospace", color: "#38bdf8" }}>{fmtINR(wallet)}</span>
                  </div>
                </div>
                <button style={Object.assign({}, orderSide === "BUY" ? C.bG : C.bR, { width: "100%", padding: 12, fontSize: 15 })} onClick={function() { execOrder(selStock.symbol, orderSide, orderQty, selStock.data.price); }}>
                  {orderSide} {orderQty} x {selStock.symbol}
                </button>
              </div>
              <div style={Object.assign({}, C.card, { border: "1px solid #7c3aed40" })}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {badge("#a78bfa", "AI ANALYSIS")}
                </div>
                <div style={{ background: sc + "18", border: "1px solid " + sc + "40", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: sc }}>{pred.signal}</span>
                    <span style={{ fontFamily: "Consolas,monospace", color: sc, fontWeight: 700 }}>{pred.conf}%</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{pred.reason}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[["SMA 5", "Rs." + pred.sma5], ["SMA 10", "Rs." + pred.sma10]].map(function(item) {
                    return (
                      <div key={item[0]} style={{ background: "#1e293b", borderRadius: 8, padding: 10 }}>
                        <div style={C.lbl}>{item[0]}</div>
                        <div style={{ fontFamily: "Consolas,monospace", fontWeight: 600 }}>{item[1]}</div>
                      </div>
                    );
                  })}
                </div>
                {pred.signal !== "HOLD" && (
                  <button style={Object.assign({}, C.bP, { width: "100%", padding: 11 })} onClick={function() { execOrder(selStock.symbol, pred.signal, orderQty, selStock.data.price, true); }}>
                    AI Execute {pred.signal}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>NSE / BSE Stocks</h2>
          <span style={{ fontSize: 12, color: "#475569" }}>Live · 3s refresh</span>
        </div>
        <div style={Object.assign({}, C.card, { padding: 0, overflow: "hidden" })}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 130px", gap: 10, padding: "10px 16px", borderBottom: "1px solid #1e293b" }}>
            {["Company", "Price", "Change", "Volume", "Trend", "Action"].map(function(h) {
              return <div key={h} style={C.lbl}>{h}</div>;
            })}
          </div>
          {NSE_STOCKS.map(function(stock) {
            var d = prices[stock.symbol];
            if (!d) return null;
            return (
              <div key={stock.symbol} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 130px", gap: 10, padding: "12px 16px", borderBottom: "1px solid #0f172a", cursor: "pointer" }}
                onMouseEnter={function(e) { e.currentTarget.style.background = "#1e293b"; }}
                onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}
                onClick={function() { setSelStock(Object.assign({}, stock, { data: d, candles: makeCandles(d.price) })); }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{stock.symbol}</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{stock.name}</div>
                </div>
                <div style={{ fontFamily: "Consolas,monospace", fontWeight: 600 }}>Rs.{d.price.toFixed(2)}</div>
                <div>
                  <div style={{ color: d.pct >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600, fontSize: 13 }}>{d.pct >= 0 ? "+" : ""}{d.pct}%</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{d.change >= 0 ? "+" : ""}{d.change.toFixed(2)}</div>
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{(d.volume / 1e6).toFixed(2)}M</div>
                <Spark data={sparks[stock.symbol]} color={d.pct >= 0 ? "#22c55e" : "#ef4444"} w={70} h={24} />
                <div style={{ display: "flex", gap: 6 }} onClick={function(e) { e.stopPropagation(); }}>
                  <button style={Object.assign({}, C.bG, { padding: "5px 10px", fontSize: 12 })} onClick={function() { execOrder(stock.symbol, "BUY", 1, d.price); }}>BUY</button>
                  <button style={Object.assign({}, C.bR, { padding: "5px 10px", fontSize: 12 })} onClick={function() { execOrder(stock.symbol, "SELL", 1, d.price); }}>SELL</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── F&O ───────────────────────────────────────────────────
  function FnoPage() {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Futures and Options</h2>
          <p style={{ fontSize: 13, color: "#475569" }}>NSE Derivatives · Expiry: Jan 30, 2025</p>
        </div>
        <div style={Object.assign({}, C.g2, { marginBottom: 18 })}>
          {[{ name: "NIFTY 50", val: nifty, lot: 25 }, { name: "BANK NIFTY", val: sensex / 3.3, lot: 15 }].map(function(idx) {
            return (
              <div key={idx.name} style={{ background: "linear-gradient(135deg,#0c1a2e,#0f1d35)", border: "1px solid #1e3a5f", borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 12, color: "#475569" }}>{idx.name}</div>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "Consolas,monospace", color: "#22c55e" }}>{idx.val.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>Lot: {idx.lot} | Margin ~Rs.{fmtNum((idx.val * idx.lot * 0.1).toFixed(0))}</div>
              </div>
            );
          })}
        </div>
        <div style={C.card}>
          <div style={C.sec}>Options Chain</div>
          {FNO_LIST.map(function(fno) {
            var baseP = fno.symbol === "NIFTY" ? nifty : fno.symbol === "BANKNIFTY" ? sensex / 3.3 : (prices[fno.symbol] && prices[fno.symbol].price) || 1000;
            var callP = parseFloat((baseP * 0.02).toFixed(2));
            var putP = parseFloat((baseP * 0.018).toFixed(2));
            return (
              <div key={fno.symbol} style={{ borderBottom: "1px solid #1e293b", padding: "14px 0" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontWeight: 700 }}>{fno.symbol}</span>
                  <span style={{ fontSize: 12, color: "#475569" }}>{fno.name} · Lot: {fno.lotSize}</span>
                </div>
                <div style={C.g2}>
                  {["CALL", "PUT"].map(function(type) {
                    var prem = type === "CALL" ? callP : putP;
                    return (
                      <div key={type} style={{ background: "#1e293b", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          {badge(type === "CALL" ? "#22c55e" : "#ef4444", type)}
                          <div style={{ fontSize: 14, fontFamily: "Consolas,monospace", marginTop: 6, fontWeight: 700, color: type === "CALL" ? "#22c55e" : "#ef4444" }}>Rs.{prem}</div>
                          <div style={{ fontSize: 11, color: "#475569" }}>Strike: Rs.{(baseP * 1.01).toFixed(0)}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <button style={Object.assign({}, type === "CALL" ? C.bG : C.bR, { padding: "5px 12px", fontSize: 12 })} onClick={function() {
                            var cost = prem * fno.lotSize;
                            if (cost > wallet) { toast("Insufficient balance", "err"); return; }
                            setWallet(function(w) { return parseFloat((w - cost).toFixed(2)); });
                            setOrders(function(prev) { return [{ id: Date.now(), symbol: fno.symbol, side: "BUY " + type, qty: fno.lotSize, price: prem, isAI: false, timestamp: new Date().toLocaleString("en-IN"), status: "EXECUTED" }].concat(prev); });
                            toast("Bought " + fno.symbol + " " + type + " @ Rs." + prem);
                          }}>BUY</button>
                          <button style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #ef444440", color: "#ef4444", padding: "5px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }} onClick={function() { toast(fno.symbol + " " + type + " write order placed"); }}>WRITE</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── MUTUAL FUNDS ──────────────────────────────────────────
  function MFPage() {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Mutual Funds</h2>
          <span style={{ fontSize: 12, color: "#475569" }}>SEBI Regulated · SIP and Lump Sum</span>
        </div>
        {mfHoldings.length > 0 && (
          <div style={Object.assign({}, C.card, { marginBottom: 16, borderColor: "#0ea5e930" })}>
            <div style={C.sec}>My MF Holdings</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
              {mfHoldings.map(function(h) {
                var cur = h.units * h.nav;
                var pnl = cur - h.invested;
                return (
                  <div key={h.id} style={{ background: "#1e293b", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>Units: {h.units}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <span style={{ fontSize: 12, fontFamily: "Consolas,monospace" }}>{fmtINR(cur)}</span>
                      <span style={{ fontSize: 12, color: pnl >= 0 ? "#22c55e" : "#ef4444" }}>{pnl >= 0 ? "+" : ""}{fmtINR(pnl)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 14 }}>
          {MUTUAL_FUNDS.map(function(fund) {
            return (
              <div key={fund.id} style={C.card}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{fund.name}</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {badge("#38bdf8", fund.category)}
                  {badge(fund.risk === "Low" ? "#22c55e" : fund.risk === "High" ? "#ef4444" : "#f59e0b", fund.risk + " Risk")}
                </div>
                <div style={Object.assign({}, C.g2, { marginBottom: 12 })}>
                  <div style={{ background: "#1e293b", borderRadius: 8, padding: 10 }}>
                    <div style={C.lbl}>NAV</div>
                    <div style={{ fontFamily: "Consolas,monospace", fontWeight: 600 }}>Rs.{fund.nav}</div>
                  </div>
                  <div style={{ background: "#1e293b", borderRadius: 8, padding: 10 }}>
                    <div style={C.lbl}>1Y Return</div>
                    <div style={{ fontFamily: "Consolas,monospace", fontWeight: 600, color: "#22c55e" }}>+{fund.ret}%</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={Object.assign({}, C.bB, { flex: 1, padding: "9px 0" })} onClick={function() { investMF(fund, 5000); }}>SIP Rs.5,000</button>
                  <button style={Object.assign({}, C.bP, { flex: 1, padding: "9px 0" })} onClick={function() { investMF(fund, 10000); }}>Lump Rs.10,000</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── ANALYZER ─────────────────────────────────────────────
  function AnalyzerPage() {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>AI Stock Analyzer</h2>
          <p style={{ fontSize: 13, color: "#475569" }}>Real-time AI predictions · Auto execution · Risk management</p>
        </div>
        <div style={{ background: "linear-gradient(135deg,#1c0a2e,#1a0a28)", border: "1px solid #7c3aed50", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 700, color: "#c4b5fd", fontSize: 16 }}>AI Risk Management</span>
            {badge("#a78bfa", "REQUIRED")}
          </div>
          <p style={{ fontSize: 13, color: "#7c3aed", marginBottom: 14 }}>Set the maximum loss you are willing to accept per AI trade.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={C.lbl}>Max Loss Per Trade (Rs.)</label>
              <input style={Object.assign({}, C.inp, { borderColor: "#7c3aed50" })} type="number" value={lossLimit} onChange={function(e) { setLossLimit(parseFloat(e.target.value) || 0); }} />
            </div>
            <div>
              <label style={C.lbl}>Current Limit</label>
              <div style={Object.assign({}, C.inp, { fontFamily: "Consolas,monospace", color: "#fde047", fontWeight: 700 })}>Rs.{fmtNum(lossLimit)}</div>
            </div>
            <div>
              <label style={C.lbl}>% of Wallet</label>
              <div style={Object.assign({}, C.inp, { fontFamily: "Consolas,monospace", fontWeight: 700, color: (lossLimit / wallet) * 100 > 10 ? "#ef4444" : "#22c55e" })}>{((lossLimit / wallet) * 100).toFixed(2)}%</div>
            </div>
          </div>
        </div>
        <div style={C.sec}>Live AI Signals</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14 }}>
          {NSE_STOCKS.map(function(stock) {
            var d = prices[stock.symbol];
            if (!d) return null;
            var pred = aiSignal(makeCandles(d.price));
            var sc = { BUY: "#22c55e", SELL: "#ef4444", HOLD: "#f59e0b" }[pred.signal];
            return (
              <div key={stock.symbol} style={Object.assign({}, C.card, { borderColor: sc + "30" })}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{stock.symbol}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{stock.sector}</div>
                  </div>
                  {badge(sc, pred.signal)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "Consolas,monospace", fontWeight: 600 }}>Rs.{d.price.toFixed(2)}</span>
                  <span style={{ fontFamily: "Consolas,monospace", color: sc, fontWeight: 700 }}>{pred.conf}%</span>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 4, height: 4, marginBottom: 8 }}>
                  <div style={{ width: pred.conf + "%", height: "100%", background: sc, borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>{pred.reason}</div>
                {pred.signal !== "HOLD" && (
                  <button style={Object.assign({}, C.bP, { width: "100%", padding: "8px 0", fontSize: 12 })} onClick={function() { execOrder(stock.symbol, pred.signal, 1, d.price, true); }}>
                    AI Execute {pred.signal}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── PORTFOLIO ─────────────────────────────────────────────
  function PortfolioPage() {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>My Portfolio</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
          {[["Invested", fmtINR(portCost), "#64748b"], ["Current Value", fmtINR(portValue), "#38bdf8"], ["Total P&L", fmtINR(portPnL), portPnL >= 0 ? "#22c55e" : "#ef4444"]].map(function(item) {
            return (
              <div key={item[0]} style={Object.assign({}, C.card, { textAlign: "center" })}>
                <div style={C.lbl}>{item[0]}</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "Consolas,monospace", color: item[2] }}>{item[1]}</div>
              </div>
            );
          })}
        </div>
        <div style={Object.assign({}, C.card, { marginBottom: 16 })}>
          <div style={C.sec}>Stock Holdings</div>
          {portfolio.length === 0
            ? <div style={{ color: "#334155", textAlign: "center", padding: "22px 0" }}>No holdings yet. Start trading!</div>
            : portfolio.map(function(p) {
              var ltp = (prices[p.symbol] && prices[p.symbol].price) || p.avg;
              var pnl = (ltp - p.avg) * p.qty;
              var pct = ((ltp - p.avg) / p.avg * 100).toFixed(2);
              return (
                <div key={p.symbol} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: 10, padding: "12px 0", borderBottom: "1px solid #1e293b", alignItems: "center" }}>
                  <div><div style={{ fontWeight: 600 }}>{p.symbol}</div><div style={{ fontSize: 11, color: "#475569" }}>{p.name}</div></div>
                  <div style={{ fontFamily: "Consolas,monospace" }}>{p.qty}</div>
                  <div style={{ fontFamily: "Consolas,monospace" }}>Rs.{p.avg}</div>
                  <div style={{ fontFamily: "Consolas,monospace" }}>Rs.{ltp.toFixed(2)}</div>
                  <div>
                    <div style={{ color: pnl >= 0 ? "#22c55e" : "#ef4444", fontFamily: "Consolas,monospace", fontWeight: 600 }}>{pnl >= 0 ? "+" : ""}Rs.{pnl.toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: pnl >= 0 ? "#22c55e" : "#ef4444" }}>{pnl >= 0 ? "+" : ""}{pct}%</div>
                  </div>
                  <button style={Object.assign({}, C.bR, { padding: "6px 10px", fontSize: 12 })} onClick={function() { execOrder(p.symbol, "SELL", p.qty, ltp); }}>SELL ALL</button>
                </div>
              );
            })
          }
        </div>
        <div style={C.card}>
          <div style={C.sec}>Order History</div>
          {orders.length === 0
            ? <div style={{ color: "#334155", textAlign: "center", padding: "18px 0" }}>No orders yet.</div>
            : orders.slice(0, 12).map(function(o, i) {
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {badge(o.side.startsWith("BUY") ? "#22c55e" : "#ef4444", o.side)}
                    {o.isAI && badge("#a78bfa", "AI")}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{o.symbol}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{o.timestamp}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "Consolas,monospace", fontSize: 13, fontWeight: 600 }}>Rs.{o.price.toFixed(2)} x {o.qty}</div>
                    {badge("#22c55e", "EXECUTED")}
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }

  // ── PROFILE ───────────────────────────────────────────────
  function ProfilePage() {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ background: "linear-gradient(135deg,#0c1a2e,#0f1d35)", border: "1px solid #1e3a5f", borderRadius: 18, padding: 22, marginBottom: 18, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 60, height: 60, background: "linear-gradient(135deg,#0ea5e9,#7c3aed)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0 }}>U</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>Investor Profile</h2>
            <div style={{ fontSize: 13, color: "#475569" }}>StockBite Member · NSE/BSE Trader</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {badge("#38bdf8", "Verified KYC")}
              {badge("#22c55e", "Active Trader")}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#475569" }}>Total Value</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "Consolas,monospace", color: "#38bdf8" }}>{fmtINR(wallet + portValue)}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, background: "#0f172a", padding: 4, borderRadius: 10, marginBottom: 16, width: "fit-content" }}>
          {["overview", "wallet", "transactions"].map(function(t) {
            return <button key={t} style={{ background: profileTab === t ? "#1e293b" : "none", color: profileTab === t ? "#38bdf8" : "#64748b", border: "none", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, textTransform: "capitalize" }} onClick={function() { setProfileTab(t); }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>;
          })}
        </div>
        {profileTab === "overview" && (
          <div style={C.g2}>
            <div style={C.card}>
              <div style={C.sec}>Account Summary</div>
              {[["Wallet Balance", fmtINR(wallet), "#38bdf8"], ["Invested", fmtINR(portCost), "#94a3b8"], ["Market Value", fmtINR(portValue), "#22c55e"], ["Unrealized P&L", fmtINR(portPnL), portPnL >= 0 ? "#22c55e" : "#ef4444"], ["Total Orders", orders.length, "#94a3b8"], ["AI Orders", aiOrders.length, "#a78bfa"]].map(function(item) {
                return (
                  <div key={item[0]} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{item[0]}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "Consolas,monospace", color: item[2] }}>{item[1]}</span>
                  </div>
                );
              })}
            </div>
            <div style={C.card}>
              <div style={C.sec}>Trading Stats</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[["Win Rate", "67%", "#22c55e"], ["AI Accuracy", "72%", "#a78bfa"], ["Avg Return", "+8.2%", "#22c55e"], ["Risk Score", "3.4/10", "#fbbf24"]].map(function(item) {
                  return (
                    <div key={item[0]} style={{ background: "#1e293b", borderRadius: 10, padding: 14, textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: item[2], fontFamily: "Consolas,monospace" }}>{item[1]}</div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{item[0]}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ background: "#1c1400", border: "1px solid #fde04730", borderRadius: 8, padding: 12, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#fbbf24" }}>AI Loss Limit</span>
                <span style={{ fontFamily: "Consolas,monospace", fontWeight: 700, color: "#fde047" }}>Rs.{fmtNum(lossLimit)}</span>
              </div>
            </div>
          </div>
        )}
        {profileTab === "wallet" && (
          <div style={C.g2}>
            <div style={C.card}>
              <div style={C.sec}>Wallet</div>
              <div style={{ background: "linear-gradient(135deg,#0c1a2e,#0f1d35)", border: "1px solid #1e3a5f", borderRadius: 12, padding: 16, marginBottom: 14, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>Available Balance</div>
                <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "Consolas,monospace", color: "#38bdf8" }}>{fmtINR(wallet)}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={C.lbl}>Amount (Rs.)</label>
                <input style={C.inp} type="number" placeholder="Enter amount..." value={txAmt} onChange={function(e) { setTxAmt(e.target.value); }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <button style={Object.assign({}, C.bG, { padding: 11 })} onClick={creditWallet}>+ Add Funds</button>
                <button style={Object.assign({}, C.bR, { padding: 11 })} onClick={debitWallet}>- Withdraw</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                {[5000, 10000, 25000, 50000, 100000, 200000].map(function(a) {
                  return <button key={a} onClick={function() { setTxAmt(String(a)); }} style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", padding: "8px 0", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Rs.{fmtNum(a)}</button>;
                })}
              </div>
            </div>
            <div style={C.card}>
              <div style={C.sec}>Quick Stats</div>
              {[["Total Credited", fmtINR(txHistory.filter(function(t) { return t.type === "CREDIT"; }).reduce(function(a, t) { return a + t.amount; }, 0)), "#22c55e"], ["Total Withdrawn", fmtINR(txHistory.filter(function(t) { return t.type === "DEBIT"; }).reduce(function(a, t) { return a + t.amount; }, 0)), "#ef4444"], ["Used in Trades", fmtINR(portCost), "#38bdf8"]].map(function(item) {
                return (
                  <div key={item[0]} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #1e293b" }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{item[0]}</span>
                    <span style={{ fontFamily: "Consolas,monospace", fontWeight: 700, color: item[2] }}>{item[1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {profileTab === "transactions" && (
          <div style={C.card}>
            <div style={C.sec}>Transaction History</div>
            {txHistory.map(function(tx, i) {
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1e293b" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, background: tx.type === "CREDIT" ? "#052e16" : "#450a0a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: tx.type === "CREDIT" ? "#22c55e" : "#ef4444", fontSize: 16, fontWeight: 700 }}>
                      {tx.type === "CREDIT" ? "+" : "-"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{tx.note}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{tx.date}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "Consolas,monospace", fontWeight: 700, fontSize: 15, color: tx.type === "CREDIT" ? "#22c55e" : "#ef4444" }}>
                    {tx.type === "CREDIT" ? "+" : "-"}{fmtINR(tx.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── PAGE ROUTER ───────────────────────────────────────────
  function CurrentPage() {
    if (page === "home") return <HomePage />;
    if (page === "stocks") return <StocksPage />;
    if (page === "fno") return <FnoPage />;
    if (page === "mf") return <MFPage />;
    if (page === "analyzer") return <AnalyzerPage />;
    if (page === "portfolio") return <PortfolioPage />;
    if (page === "profile") return <ProfilePage />;
    return <HomePage />;
  }

  return (
    <div style={C.app}>
      {/* HEADER */}
      <header style={C.hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "linear-gradient(135deg,#0ea5e9,#7c3aed)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16 }}>S</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#f1f5f9" }}>StockBite</div>
            <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: 1 }}>AI TRADING</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", gap: 18 }}>
            {[["NIFTY", nifty], ["SENSEX", sensex]].map(function(item) {
              return (
                <div key={item[0]} style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#475569" }}>{item[0]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Consolas,monospace", color: "#22c55e" }}>{fmtNum(item[1].toFixed(2))}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "5px 12px" }}>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "Consolas,monospace", color: "#38bdf8" }}>{fmtINR(wallet)}</span>
          </div>
          <button style={Object.assign({}, C.bP, { fontSize: 13, padding: "7px 14px" })} onClick={function() { setChatOpen(true); }}>
            AI Chat
          </button>
        </div>
      </header>

      {/* TICKER */}
      <div style={{ background: "#050d1a", borderBottom: "1px solid #1e293b", overflow: "hidden", padding: "6px 0" }}>
        <div style={{ display: "flex", gap: 26, animation: "scroll 50s linear infinite", whiteSpace: "nowrap" }}>
          <style>{".tickanim{animation:scroll 50s linear infinite} @keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}"}</style>
          {NSE_STOCKS.concat(NSE_STOCKS).map(function(s, i) {
            var d = prices[s.symbol];
            if (!d) return null;
            return (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                <span style={{ color: "#94a3b8", fontWeight: 600 }}>{s.symbol}</span>
                <span style={{ fontFamily: "Consolas,monospace" }}>{d.price.toFixed(2)}</span>
                <span style={{ color: d.pct >= 0 ? "#22c55e" : "#ef4444" }}>{d.pct >= 0 ? "+" : ""}{d.pct}%</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* NAV */}
      <nav style={C.nav}>
        {navBtn("home", "Home")}
        {navBtn("stocks", "Stocks")}
        {navBtn("fno", "F&O")}
        {navBtn("mf", "Mutual Funds")}
        {navBtn("analyzer", "AI Analyzer")}
        {navBtn("portfolio", "Portfolio")}
        {navBtn("profile", "Profile")}
      </nav>

      {/* TOAST */}
      {notif && (
        <div style={{ position: "fixed", top: 62, right: 16, zIndex: 2000, padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: notif.type === "err" ? "#450a0a" : "#052e16", border: "1px solid " + (notif.type === "err" ? "#dc2626" : "#16a34a"), color: notif.type === "err" ? "#fca5a5" : "#4ade80", maxWidth: 300 }}>
          {notif.msg}
        </div>
      )}

      {/* MAIN */}
      <main style={C.main}><CurrentPage /></main>

      {/* CHAT */}
      {chatOpen && (
        <div style={{ position: "fixed", bottom: 16, right: 16, width: 350, height: 490, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, display: "flex", flexDirection: "column", zIndex: 500, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          <div style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: "16px 16px 0 0", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>AI</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>StockBite AI</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>NSE Market Expert</div>
              </div>
            </div>
            <button onClick={function() { setChatOpen(false); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 14 }}>x</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {chatMsgs.map(function(m, i) {
              return (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 6 }}>
                  <div style={{ padding: "9px 13px", borderRadius: m.role === "bot" ? "12px 12px 12px 0" : "12px 12px 0 12px", background: m.role === "bot" ? "#1e293b" : "linear-gradient(135deg,#0284c7,#38bdf8)", maxWidth: "82%", fontSize: 13, lineHeight: 1.5 }}>{m.text}</div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: "10px 12px", borderTop: "1px solid #1e293b", display: "flex", gap: 8 }}>
            <input style={Object.assign({}, C.inp, { fontSize: 13 })} placeholder="Ask about NSE stocks..." value={chatInput} onChange={function(e) { setChatInput(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") sendChat(); }} />
            <button style={Object.assign({}, C.bP, { padding: "9px 12px", flexShrink: 0 })} onClick={sendChat}>Go</button>
          </div>
          <div style={{ padding: "4px 12px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Nifty outlook", "Best IT stocks", "F&O tips", "MF picks"].map(function(q) {
              return <button key={q} onClick={function() { setChatInput(q); }} style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", padding: "3px 9px", borderRadius: 12, cursor: "pointer", fontSize: 11 }}>{q}</button>;
            })}
          </div>
        </div>
      )}

      {/* AI MODAL */}
      {showAIModal && pendingAI && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#0f172a", border: "1px solid #7c3aed40", borderRadius: 16, padding: 24, width: 400, maxWidth: "95vw" }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>AI Order Request</h3>
            <p style={{ fontSize: 12, color: "#7c3aed", marginBottom: 16 }}>StockBite AI wants to execute a trade</p>
            <div style={{ background: "#1e293b", borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["Stock", pendingAI.symbol], ["Signal", pendingAI.signal], ["Price", "Rs." + (pendingAI.price || 0).toFixed(2)], ["Confidence", (pendingAI.conf || 0) + "%"]].map(function(item) {
                  return (
                    <div key={item[0]}>
                      <div style={C.lbl}>{item[0]}</div>
                      <div style={{ fontWeight: 700, color: item[0] === "Signal" ? (pendingAI.signal === "BUY" ? "#22c55e" : "#ef4444") : "#e2e8f0" }}>{item[1]}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 10 }}>{pendingAI.reason}</div>
            </div>
            <div style={{ background: "#1c1400", border: "1px solid #fde04730", borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600, marginBottom: 8 }}>Max Loss You Accept</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input style={Object.assign({}, C.inp, { borderColor: "#fde04750" })} type="number" value={lossLimit} onChange={function(e) { setLossLimit(parseFloat(e.target.value) || 0); }} />
                <span style={{ fontFamily: "Consolas,monospace", color: "#fde047", fontWeight: 700, whiteSpace: "nowrap" }}>Rs. max</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={Object.assign({}, C.bG, { flex: 1, padding: 12, fontSize: 14 })} onClick={confirmAI}>Approve</button>
              <button style={Object.assign({}, C.bR, { flex: 1, padding: 12, fontSize: 14, background: "rgba(239,68,68,0.2)", color: "#ef4444" })} onClick={function() { setShowAIModal(false); setPendingAI(null); }}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
